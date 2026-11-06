const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },

    // User Role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Profile Picture / Avatar
    avatar: {
      type: String,
      default: "",
    },

    // Bio / Tagline
    bio: {
      type: String,
      default: "",
    },

    // Delivery Address Details
    address: {
      street: { type: String, default: "" },
      landmark: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      addressType: {
        type: String,
        enum: ["Home", "Work", "Other"],
        default: "Home",
      },
    },

    // Food & Dining Preferences
    dietaryPreference: {
      type: String,
      default: "All / Non-Veg",
    },

    favoriteDish: {
      type: String,
      default: "",
    },

    birthday: {
      type: String,
      default: "",
    },

    deliveryNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
