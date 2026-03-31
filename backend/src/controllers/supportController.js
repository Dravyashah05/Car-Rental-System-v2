const SupportMessage = require("../models/SupportMessage");

const createSupportMessage = async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const user = req.user;
    const supportMessage = await SupportMessage.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      subject: String(subject).trim(),
      message: String(message).trim()
    });

    res.status(201).json({
      ...supportMessage.toObject(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

const listSupportMessages = async (req, res, next) => {
  try {
    const messages = await SupportMessage.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email phone role")
      .lean();

    const normalized = messages.map((item) => {
      const user =
        item.user && typeof item.user === "object"
          ? {
              id: item.user._id,
              name: item.user.name,
              email: item.user.email,
              phone: item.user.phone,
              role: item.user.role
            }
          : undefined;

      return {
        ...item,
        user: user || {
          name: item.name,
          email: item.email,
          phone: item.phone
        }
      };
    });

    res.json(normalized);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSupportMessage,
  listSupportMessages
};
