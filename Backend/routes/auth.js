const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");

const router = express.Router();

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);


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


        const existingUser =
            await User.findOne({ email });


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const newUser = new User({

            name,
            email,
            phone,
            password: hashedPassword,
            role: "user"

        });


        await newUser.save();


        res.status(201).json({

            success: true,
            message: "Signup Successful"

        });


    } catch (error) {

        console.log(
            "Signup Error:",
            error
        );


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


        const user =
            await User.findOne({ email });


        if (!user) {

            return res.status(400).json({

                success: false,
                message: "User not found"

            });

        }


        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(400).json({

                success: false,
                message: "Invalid Password"

            });

        }


        const role =
            user.role || "user";


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

            user: {

                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: role

            }

        });


    } catch (error) {

        console.log(
            "Login Error:",
            error
        );


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
        const ticket =
            await googleClient.verifyIdToken({

                idToken: credential,

                audience:
                    process.env.GOOGLE_CLIENT_ID

            });


        const payload =
            ticket.getPayload();


        const googleEmail =
            payload.email;

        const googleName =
            payload.name;

        const googlePicture =
            payload.picture;


        if (!googleEmail) {

            return res.status(400).json({

                success: false,
                message: "Google email not found"

            });

        }


        // Find existing user
        let user =
            await User.findOne({
                email: googleEmail
            });


        // Create new user
        if (!user) {

            const randomPassword =
                Math.random().toString(36) +
                Date.now().toString();


            const hashedPassword =
                await bcrypt.hash(
                    randomPassword,
                    10
                );


            user = new User({

                name:
                    googleName || "Google User",

                email:
                    googleEmail,

                password:
                    hashedPassword,

                role:
                    "user"

            });


            await user.save();

        }


        const role =
            user.role || "user";


        // Create JWT
        const token =
            jwt.sign(

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

            message:
                "Google Login Successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: role,

                picture:
                    googlePicture || ""

            }

        });


    } catch (error) {

        console.log(
            "Google Login Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Google Login Failed"

        });

    }

});


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;