const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


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


        // Check required fields
        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,
                message: "Please fill all required fields"

            });

        }


        // Check if user already exists
        const existingUser =
            await User.findOne({ email });


        if (existingUser) {

            return res.status(400).json({

                success: false,
                message: "Email already registered"

            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // IMPORTANT:
        // New signup will always be a normal user
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
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Check fields
        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        // Find user
        const user =
            await User.findOne({ email });


        if (!user) {

            return res.status(400).json({

                success: false,

                message: "User not found"

            });

        }


        // Compare password
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


        // =====================================
        // USER ROLE
        // =====================================

        // If old user doesn't have role,
        // treat them as normal user.
        const role = user.role || "user";


        // =====================================
        // CREATE JWT
        // =====================================

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


        // =====================================
        // LOGIN RESPONSE
        // =====================================

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
// EXPORT ROUTER
// ==========================================

module.exports = router;