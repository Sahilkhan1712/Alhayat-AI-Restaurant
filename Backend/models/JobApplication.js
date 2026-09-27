const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        age: {
            type: Number,
            required: true
        },

        mobile: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        jobRole: {
            type: String,
            required: true,
            enum: [
                "Chef",
                "Cook",
                "Assistant Cook",
                "Waiter",
                "Cleaner",
                "Dishwasher/Bartan Cleaner",
                "Kitchen Helper",
                "Delivery Staff",
                "Other"
            ]
        },

        experience: {
            type: String,
            required: true,
            trim: true
        },

        previousCompany: {
            type: String,
            default: "",
            trim: true
        },

        expectedSalary: {
            type: String,
            required: true,
            trim: true
        },

        availability: {
            type: String,
            required: true,
            trim: true
        },

        // ==========================================
        // CV / RESUME
        // ==========================================

        cv: {
            fileName: {
                type: String,
                default: ""
            },

            contentType: {
                type: String,
                default: ""
            },

            data: {
                type: Buffer,
                default: null
            }
        },

        additionalMessage: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Shortlisted",
                "Rejected",
                "Hired"
            ],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "JobApplication",
    jobApplicationSchema
);