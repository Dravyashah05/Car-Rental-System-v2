const express = require("express");
const crypto = require("crypto");
const { verifyWebhook } = require("@clerk/backend/webhooks");
const User = require("../models/User");

const router = express.Router();

const ALLOWED_ROLES = new Set(["user", "owner", "driver", "admin"]);
const normalizeRole = (role) => (role === "driver" ? "owner" : role);

const getRoleFromClerk = (publicMetadata) => {
  if (!publicMetadata || typeof publicMetadata !== "object") return undefined;
  const raw =
    publicMetadata.role ??
    publicMetadata.appRole ??
    publicMetadata.userRole;

  if (typeof raw !== "string") return undefined;
  const normalized = raw.trim().toLowerCase();
  if (!ALLOWED_ROLES.has(normalized)) return undefined;
  return normalizeRole(normalized);
};

const pickPrimaryEmail = (data) => {
  const primaryId = data.primary_email_address_id;
  if (primaryId && Array.isArray(data.email_addresses)) {
    const primary = data.email_addresses.find((item) => item.id === primaryId);
    if (primary?.email_address) return primary.email_address;
  }
  return data.email_addresses?.[0]?.email_address;
};

const pickPrimaryPhone = (data) => {
  const primaryId = data.primary_phone_number_id;
  if (primaryId && Array.isArray(data.phone_numbers)) {
    const primary = data.phone_numbers.find((item) => item.id === primaryId);
    if (primary?.phone_number) return primary.phone_number;
  }
  return data.phone_numbers?.[0]?.phone_number;
};

const buildName = (data, email) => {
  const firstName = data.first_name || "";
  const lastName = data.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || data.username || email || "User";
};

const upsertUserFromClerkPayload = async (data) => {
  if (!data?.id) return;
  const email = pickPrimaryEmail(data);
  if (!email) return;

  let user = await User.findOne({ clerkId: data.id });
  const roleFromClerk = getRoleFromClerk(data.public_metadata);

  if (!user) {
    user = await User.findOne({ email: email.toLowerCase().trim() });
  }

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    await User.create({
      name: buildName(data, email),
      email: email.toLowerCase().trim(),
      phone: pickPrimaryPhone(data),
      password: randomPassword,
      avatar: data.image_url,
      clerkId: data.id,
      role: roleFromClerk || "user"
    });
    return;
  }

  let didUpdate = false;

  if (!user.clerkId) {
    user.clerkId = data.id;
    didUpdate = true;
  }

  if (user.clerkId === data.id) {
    const nextName = buildName(data, email);
    if (nextName && user.name !== nextName) {
      user.name = nextName;
      didUpdate = true;
    }
    const nextEmail = email.toLowerCase().trim();
    if (nextEmail && user.email !== nextEmail) {
      user.email = nextEmail;
      didUpdate = true;
    }
    const nextPhone = pickPrimaryPhone(data);
    if (nextPhone && user.phone !== nextPhone) {
      user.phone = nextPhone;
      didUpdate = true;
    }
    if (data.image_url && user.avatar !== data.image_url) {
      user.avatar = data.image_url;
      didUpdate = true;
    }
  }

  if (!user.clerkId && user.email === email.toLowerCase().trim()) {
    if (!user.name) {
      user.name = buildName(data, email);
      didUpdate = true;
    }
    if (!user.phone) {
      user.phone = pickPrimaryPhone(data);
      didUpdate = true;
    }
    if (!user.avatar && data.image_url) {
      user.avatar = data.image_url;
      didUpdate = true;
    }
  }

  if (roleFromClerk && user.role !== roleFromClerk) {
    user.role = roleFromClerk;
    didUpdate = true;
  }

  if (didUpdate) {
    await user.save();
  }
};

const unlinkClerkUser = async (data) => {
  if (!data?.id) return;
  const user = await User.findOne({ clerkId: data.id });
  if (!user) return;
  user.clerkId = undefined;
  await user.save();
};

router.post("/clerk", async (req, res) => {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    return res.status(500).json({ message: "Missing CLERK_WEBHOOK_SIGNING_SECRET" });
  }

  try {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        headers.set(key, value.join(","));
      } else if (typeof value === "string") {
        headers.set(key, value);
      }
    });

    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const request = new Request(url, {
      method: "POST",
      headers,
      body: req.body
    });

    const event = await verifyWebhook(request, { signingSecret });

    if (event.type === "user.created" || event.type === "user.updated") {
      await upsertUserFromClerkPayload(event.data);
    } else if (event.type === "user.deleted") {
      await unlinkClerkUser(event.data);
    }

    return res.json({ received: true });
  } catch (err) {
    return res.status(400).json({ message: "Webhook verification failed" });
  }
});

module.exports = router;
