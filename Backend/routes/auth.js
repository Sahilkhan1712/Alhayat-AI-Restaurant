const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

function formatUserProfile(user) {
    return {
        id: user._id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
        avatar: user.avatar || "",
        bio: user.bio || "",
        address: {
            street: (user.address && user.address.street) || "",
            landmark: (user.address && user.address.landmark) || "",
            city: (user.address && user.address.city) || "",
            state: (user.address && user.address.state) || "",
            pincode: (user.address && user.address.pincode) || "",
            addressType: (user.address && user.address.addressType) || "Home"
        },
        dietaryPreference: user.dietaryPreference || "All / Non-Veg",
        favoriteDish: user.favoriteDish || "",
        birthday: user.birthday || "",
        deliveryNotes: user.deliveryNotes || "",
        createdAt: user.createdAt
    };
}


// ==========================================
// SIGNUP
// ==========================================

router.post("/signup", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            phone: phone || "",
            password: hashedPassword,
            role: "user"
        });

        await newUser.save();

        const token = jwt.sign(
            {
                id: newUser._id,
                role: newUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(201).json({
            success: true,
            message: "Signup Successful",
            token,
            user: formatUserProfile(newUser)
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// ==========================================
// NORMAL LOGIN
// ==========================================

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            });
        }

        const role = user.role || "user";

        const token = jwt.sign(
            {
                id: user._id,
                role: role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Login Successful",
            token,
            user: formatUserProfile(user)
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// ==========================================
// GOOGLE LOGIN
// ==========================================

router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required"
            });
        }

        // Verify Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const googleEmail = payload.email;
        const googleName = payload.name;
        const googlePicture = payload.picture;

        if (!googleEmail) {
            return res.status(400).json({
                success: false,
                message: "Google email not found"
            });
        }

        // Find existing user
        let user = await User.findOne({ email: googleEmail });

        // Create new user if not found
        if (!user) {
            const randomPassword =
                Math.random().toString(36) +
                Date.now().toString();

            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = new User({
                name: googleName || "Google User",
                email: googleEmail,
                password: hashedPassword,
                role: "user",
                phone: "",
                avatar: googlePicture || ""
            });

            await user.save();
        } else if (!user.avatar && googlePicture) {
            user.avatar = googlePicture;
            await user.save();
        }

        const role = user.role || "user";

        // Create JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            message: "Google Login Successful",
            token,
            user: formatUserProfile(user)
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Google Login Failed"
        });
    }
});


// ==========================================
// GET USER PROFILE
// ==========================================

router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: formatUserProfile(user)
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


// ==========================================
// UPDATE USER PROFILE
// ==========================================

router.put("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const {
            name,
            phone,
            avatar,
            bio,
            address,
            dietaryPreference,
            favoriteDish,
            birthday,
            deliveryNotes
        } = req.body;

        if (name && typeof name === "string") {
            user.name = name.trim();
        }

        if (phone !== undefined) {
            user.phone = String(phone).trim();
        }

        if (avatar !== undefined) {
            user.avatar = String(avatar).trim();
        }

        if (bio !== undefined) {
            user.bio = String(bio).trim();
        }

        if (address && typeof address === "object") {
            user.address = {
                street: address.street !== undefined ? String(address.street).trim() : (user.address?.street || ""),
                landmark: address.landmark !== undefined ? String(address.landmark).trim() : (user.address?.landmark || ""),
                city: address.city !== undefined ? String(address.city).trim() : (user.address?.city || ""),
                state: address.state !== undefined ? String(address.state).trim() : (user.address?.state || ""),
                pincode: address.pincode !== undefined ? String(address.pincode).trim() : (user.address?.pincode || ""),
                addressType: address.addressType && ["Home", "Work", "Other"].includes(address.addressType)
                    ? address.addressType
                    : (user.address?.addressType || "Home")
            };
        }

        if (dietaryPreference !== undefined) {
            user.dietaryPreference = String(dietaryPreference).trim();
        }

        if (favoriteDish !== undefined) {
            user.favoriteDish = String(favoriteDish).trim();
        }

        if (birthday !== undefined) {
            user.birthday = String(birthday).trim();
        }

        if (deliveryNotes !== undefined) {
            user.deliveryNotes = String(deliveryNotes).trim();
        }

        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: formatUserProfile(user)
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
});


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
