const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { createClerkClient, verifyToken } = require("@clerk/backend");
const User = require("../models/User");

const ALLOWED_ROLES = new Set(["user", "owner", "driver", "admin"]);

const getAuthorizedParties = () => {
  const raw = process.env.CLERK_AUTHORIZED_PARTIES;
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const getClerkClient = () => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  return createClerkClient({ secretKey });
};

const pickPrimaryEmail = (clerkUser) => {
  const primaryId = clerkUser.primaryEmailAddressId;
  if (primaryId) {
    const primary = clerkUser.emailAddresses?.find((item) => item.id === primaryId);
    if (primary?.emailAddress) return primary.emailAddress;
  }
  return clerkUser.emailAddresses?.[0]?.emailAddress;
};

const pickPrimaryPhone = (clerkUser) => {
  const primaryId = clerkUser.primaryPhoneNumberId;
  if (primaryId) {
    const primary = clerkUser.phoneNumbers?.find((item) => item.id === primaryId);
    if (primary?.phoneNumber) return primary.phoneNumber;
  }
  return clerkUser.phoneNumbers?.[0]?.phoneNumber;
};

const normalizeRole = (role) => (role === "driver" ? "owner" : role);

const getRoleFromClerk = (clerkUser) => {
  const raw =
    clerkUser?.publicMetadata?.role ??
    clerkUser?.publicMetadata?.appRole ??
    clerkUser?.publicMetadata?.userRole;

  if (typeof raw !== "string") return undefined;
  const normalized = raw.trim().toLowerCase();
  if (!ALLOWED_ROLES.has(normalized)) return undefined;
  return normalizeRole(normalized);
};

const getOrCreateUserFromClerk = async (clerkUserId) => {
  const clerkClient = getClerkClient();
  if (!clerkClient) {
    throw new Error("Missing CLERK_SECRET_KEY");
  }

  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = pickPrimaryEmail(clerkUser);

  if (!email) {
    throw new Error("Clerk user is missing an email");
  }

  let user = await User.findOne({ clerkId: clerkUser.id });
  if (!user) {
    user = await User.findOne({ email: email.toLowerCase().trim() });
  }

  const name =
    clerkUser.fullName ||
    clerkUser.firstName ||
    clerkUser.username ||
    email;
  const roleFromClerk = getRoleFromClerk(clerkUser);

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone: pickPrimaryPhone(clerkUser),
      password: randomPassword,
      avatar: clerkUser.imageUrl,
      clerkId: clerkUser.id,
      role: roleFromClerk || "user"
    });
    return user;
  }

  let didUpdate = false;
  if (!user.clerkId) {
    user.clerkId = clerkUser.id;
    didUpdate = true;
  }
  if (!user.avatar && clerkUser.imageUrl) {
    user.avatar = clerkUser.imageUrl;
    didUpdate = true;
  }
  if (!user.name && name) {
    user.name = name;
    didUpdate = true;
  }
  if (!user.phone && clerkUser.phoneNumbers?.length) {
    user.phone = pickPrimaryPhone(clerkUser);
    didUpdate = true;
  }
  if (roleFromClerk && user.role !== roleFromClerk) {
    user.role = roleFromClerk;
    didUpdate = true;
  }
  if (didUpdate) {
    await user.save();
  }

  return user;
};

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    return next();
  } catch (err) {
    // Fall through to Clerk verification
  }

  if (!process.env.CLERK_SECRET_KEY) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const verificationOptions = {
      authorizedParties: getAuthorizedParties()
    };
    if (process.env.CLERK_JWT_KEY) {
      verificationOptions.jwtKey = process.env.CLERK_JWT_KEY;
    } else {
      verificationOptions.secretKey = process.env.CLERK_SECRET_KEY;
    }

    const sessionClaims = await verifyToken(token, verificationOptions);
    if (!sessionClaims?.sub) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await getOrCreateUserFromClerk(sessionClaims.sub);
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (...roles) => (req, res, next) => {
  const role = req.user?.role || "user";
  const allowed = new Set();

  roles.forEach((allowedRole) => {
    if (allowedRole === "owner") {
      allowed.add("owner");
      allowed.add("driver");
    } else if (allowedRole === "driver") {
      allowed.add("driver");
      allowed.add("owner");
    } else {
      allowed.add(allowedRole);
    }
  });

  if (!req.user || !allowed.has(role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

module.exports = { authenticate, authorize };
