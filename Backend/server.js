
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF, DOC and DOCX files are allowed."
                )
            );
        }
    }
});


require("dotenv").config();


const authRoutes = require("./routes/auth");

const Order = require("./models/order");
const Reservation = require("./models/Reservation");
const JobApplication = require("./models/JobApplication");



const app = express();
const server = http.createServer(app);


// ===============================
// SOCKET.IO
// ===============================

const io = new Server(server, {

    cors: {
        origin: "*"
    }

});

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("disconnect", () => {

        console.log("User Disconnected:", socket.id);

    });

});


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// AUTH ROUTES
// ===============================

app.use("/auth", authRoutes);


// ===============================
// JWT AUTHENTICATION
// ===============================

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {

        return res.status(401).json({
            success: false,
            message: "Access denied. Login required."
        });

    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, user) => {

            if (error) {

                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired token."
                });

            }

            req.user = user;

            next();

        }
    );

}


// ===============================
// ADMIN AUTHENTICATION
// ===============================

function adminOnly(req, res, next) {

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });

    }

    if (req.user.role !== "admin") {

        return res.status(403).json({
            success: false,
            message: "Admin access only."
        });

    }

    next();

}


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose.connect(process.env.MONGO_URI)

    .then(() => {

        console.log("MongoDB Connected");

    })

    .catch((err) => {

        console.log("MongoDB Connection Error:", err);

    });


// ===============================
// EMAIL
// ===============================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: "success1712a@gmail.com",
        pass: "YOUR_GMAIL_APP_PASSWORD"
    }

});


// ===============================
// HOME
// ===============================

app.use(express.static(path.join(__dirname, "../Forntend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Forntend/index.html"));
});

// ===============================
// ALHAYAT AI FOOD ASSISTANT
// ===============================

const restaurantMenu = [
    // 🍕 Pizza
    { name: "Margherita Pizza", price: 249, category: "Pizza", type: "Veg" },
    { name: "Farmhouse Pizza", price: 329, category: "Pizza", type: "Veg" },
    { name: "Paneer Tikka Pizza", price: 359, category: "Pizza", type: "Veg" },
    { name: "BBQ Chicken Pizza", price: 399, category: "Pizza", type: "Non-Veg" },

    // 🍔 Burger
    { name: "Classic Veg Burger", price: 149, category: "Burger", type: "Veg" },
    { name: "Paneer Supreme Burger", price: 199, category: "Burger", type: "Veg" },
    { name: "Crispy Chicken Burger", price: 229, category: "Burger", type: "Non-Veg" },
    { name: "Double Cheese Burger", price: 279, category: "Burger", type: "Veg" },

    // 🍛 Biryani & Main Course
    { name: "Mutton Biryani", price: 399, category: "Biryani", type: "Non-Veg" },
    { name: "Veg Biryani", price: 229, category: "Biryani", type: "Veg" },
    { name: "Egg Biryani", price: 249, category: "Biryani", type: "Egg" },
    { name: "Butter Chicken", price: 349, category: "Main Course", type: "Non-Veg" },
    { name: "Kadhai Paneer", price: 279, category: "Main Course", type: "Veg" },
    { name: "Dal Makhani", price: 229, category: "Main Course", type: "Veg" },

    // 🍜 Chinese
    { name: "Hakka Noodles", price: 189, category: "Noodles", type: "Veg" },
    { name: "Schezwan Noodles", price: 209, category: "Noodles", type: "Veg" },
    { name: "Chilli Paneer", price: 239, category: "Chinese", type: "Veg" },
    { name: "Veg Fried Rice", price: 179, category: "Rice", type: "Veg" },

    // 🍢 Starters
    { name: "Paneer Tikka", price: 259, category: "Starters", type: "Veg" },
    { name: "Chicken Tikka", price: 329, category: "Starters", type: "Non-Veg" },

    // 🍝 Pasta
    { name: "Creamy Alfredo Pasta", price: 249, category: "Pasta", type: "Veg" },
    { name: "Arrabbiata Pasta", price: 229, category: "Pasta", type: "Veg" },
    { name: "Chicken Pasta", price: 299, category: "Pasta", type: "Non-Veg" },

    // 🌯 Rolls & Snacks
    { name: "Paneer Kathi Roll", price: 179, category: "Rolls", type: "Veg" },
    { name: "Chicken Shawarma", price: 199, category: "Rolls", type: "Non-Veg" },
    { name: "Classic French Fries", price: 119, category: "Snacks", type: "Veg" },
    { name: "Peri Peri Fries", price: 149, category: "Snacks", type: "Veg" },

    // 🍰 Desserts
    { name: "Chocolate Brownie", price: 159, category: "Dessert", type: "Veg" },
    { name: "Gulab Jamun", price: 99, category: "Dessert", type: "Veg" },
    { name: "New York Cheesecake", price: 229, category: "Dessert", type: "Veg" },

    // 🥤 Drinks
    { name: "Cold Coffee", price: 149, category: "Drinks", type: "Veg" },
    { name: "Fresh Lime Mojito", price: 129, category: "Drinks", type: "Veg" },
    { name: "Mango Lassi", price: 139, category: "Drinks", type: "Veg" }
];


// ===============================
// AI CHAT ROUTE
// ===============================

app.post("/ai-chat", async (req, res) => {

    try {

        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a message."
            });
        }

        const menuText = restaurantMenu
            .map(item =>
                `${item.name} - ₹${item.price} - ${item.category} - ${item.type}`
            )
            .join("\n");

        const systemPrompt = `
You are "AlHayat AI Food Assistant", the friendly AI assistant
for AlHayat Restaurant.

Your job is to help customers choose food from the restaurant menu.

IMPORTANT RULES:

1. Only talk about food that exists in the MENU below.
2. Never invent a dish.
3. Never invent or change a price.
4. If the user asks "what food do you have?",
   explain the available categories and some popular choices.
5. If the user asks what they should eat,
   understand their preference and recommend suitable menu items.
6. If the user gives a budget, stay within that budget.
7. If the user asks for spicy food, suggest suitable spicy-style
   dishes from the menu, but don't claim an exact spice level
   unless it is obvious from the dish name.
8. If the user asks for vegetarian food, recommend only Veg items.
9. If the user asks for non-vegetarian food, recommend Non-Veg items.
10. If the user asks for something sweet, recommend desserts.
11. If the user asks for drinks, recommend drinks.
12. You can answer in English, Hindi or Hinglish according
    to the user's language.
13. Keep answers friendly, natural and conversational,
    similar to a restaurant ChatGPT assistant.
14. When recommending food, include the exact price.
15. Do not place an order yourself.
16. Do not claim that an item is available if it is not in MENU.
17. If you don't understand the request, ask a short
    clarification question.
18. For allergies or medical/dietary concerns, don't make
    medical claims. Tell the customer to confirm ingredients
    with the restaurant.

RESTAURANT MENU:

${menuText}
`;

        const conversation = [
            {
                role: "system",
                content: systemPrompt
            },
            ...history.slice(-10).map(msg => ({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: String(msg.content || "")
            })),
            {
                role: "user",
                content: message.trim()
            }
        ];

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text: systemPrompt
                            }
                        ]
                    },
                    contents: conversation
                        .filter(msg => msg.role !== "system")
                        .map(msg => ({
                            role: msg.role === "assistant" ? "model" : "user",
                            parts: [
                                {
                                    text: msg.content
                                }
                            ]
                        }))
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                `Gemini API ${response.status}: ${JSON.stringify(data.error)}`
            );
        }

        const reply =
            data.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim() ||
            "Sorry, AI could not generate a response.";





        res.json({
            success: true,
            reply
        });
    }
    catch (error) {

        console.error("❌❌❌ AI CHAT ERROR ❌❌❌");
        console.error("Message:", error.message);
        console.error("Status:", error.status);
        console.error("Code:", error.code);
        console.error("Type:", error.type);
        console.error("Full Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "AI Assistant error"
        });
    }
});


// ===============================
// PLACE ORDER
// ===============================

const youpiApiUrl = String(process.env.YOUPI_API_URL || "http://localhost:6100").replace(/\/$/, "");
const frontendUrl = String(process.env.FRONTEND_URL || "http://localhost:5500").replace(/\/$/, "");

app.post("/place-order", async (req, res) => {
    try {
        const { customer, phone, userId, address, cart, paymentMethod } = req.body;
        if (!customer || !address || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ success: false, message: "Customer, address and cart are required." });
        }
        const verifiedCart = cart.map((item) => {
            const menuItem = restaurantMenu.find((menu) => menu.name === item.name);
            const qty = Number(item.qty);
            if (!menuItem || !Number.isInteger(qty) || qty < 1 || qty > 50) {
                throw new Error("Invalid cart item.");
            }
            return { name: menuItem.name, price: menuItem.price, qty };
        });
        const totalPaise = verifiedCart.reduce((sum, item) => sum + item.price * item.qty * 100, 0);
        const method = String(paymentMethod || "").trim();
        if (!method) return res.status(400).json({ success: false, message: "Payment method is required." });
        const newOrder = await new Order({ customer, phone, userId, address, cart: verifiedCart, paymentMethod: method, paymentStatus: method === "COD" ? "Pending" : "Pending", totalPaise }).save();

        if (method !== "COD") {
            const gatewayResponse = await fetch(`${youpiApiUrl}/api/v1/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Idempotency-Key": `alhayat-${newOrder._id}` },
                body: JSON.stringify({ orderId: String(newOrder._id), amount: totalPaise / 100, currency: "INR", method: "UPI", description: "AlHayat AI Restaurant order", returnUrl: `${frontendUrl}/payment-return.html?orderId=${newOrder._id}` })
            });
            const gateway = await gatewayResponse.json().catch(() => ({}));
            if (!gatewayResponse.ok || !gateway.paymentId || !gateway.checkoutUrl) {
                await Order.findByIdAndUpdate(newOrder._id, { paymentStatus: "Failed" });
                return res.status(502).json({ success: false, message: gateway.error || "Payment session could not be created. Check YOUPI_API_URL and gateway health." });
            }
            await Order.findByIdAndUpdate(newOrder._id, { paymentId: gateway.paymentId });
            return res.status(201).json({ success: true, orderId: newOrder._id, paymentId: gateway.paymentId, checkoutUrl: gateway.checkoutUrl, total: totalPaise / 100 });
        }
        return res.status(201).json({ success: true, orderId: newOrder._id, total: totalPaise / 100 });
    } catch (error) {
        if (error.message === "Invalid cart item.") return res.status(400).json({ success: false, message: error.message });

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Order not saved"

        });

    }

});

// Payment return verification: browser parameters are never trusted as proof.
app.get("/payments/verify/:orderId", async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || !order.paymentId) return res.status(404).json({ success: false, message: "Payment order not found." });
        let response = await fetch(`${youpiApiUrl}/api/v1/payments/${encodeURIComponent(order.paymentId)}`);
        let payment = await response.json().catch(() => ({}));
        // A retried checkout can leave an older terminal session on the order record.
        // Reconcile by merchant order ID, then retain only a fully matching session.
        if (!response.ok || ["FAILED", "EXPIRED", "CANCELLED"].includes(payment.status)) {
            const latestResponse = await fetch(`${youpiApiUrl}/api/v1/orders/${encodeURIComponent(String(order._id))}/cod`);
            const latest = await latestResponse.json().catch(() => ({}));
            if (latestResponse.ok && latest.paymentId) {
                response = latestResponse;
                payment = latest;
                if (latest.paymentId !== order.paymentId) await Order.findByIdAndUpdate(order._id, { paymentId: latest.paymentId });
            }
        }
        const expectedAmount = String(order.totalPaise);
        const verified = response.ok && payment.paymentId === order.paymentId && payment.orderId === String(order._id) && String(payment.amountPaise) === expectedAmount && String(payment.currency).toUpperCase() === "INR" && payment.status === "SUCCESS";
        if (verified && order.paymentStatus !== "Paid") await Order.findOneAndUpdate({ _id: order._id, paymentStatus: { $ne: "Paid" } }, { paymentStatus: "Paid" });
        return res.json({ success: verified, orderId: order._id, paymentStatus: verified ? "Paid" : order.paymentStatus, status: payment.status || "UNVERIFIED" });
    } catch (error) {
        return res.status(502).json({ success: false, message: "Payment verification unavailable." });
    }
});


// ===============================
// GET ALL ORDERS
// ADMIN ONLY
// ===============================

app.get(
    "/orders",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const orders = await Order
                .find()
                .sort({ createdAt: -1 });

            res.json(orders);

        } catch (error) {

            console.log(error);

            res.status(500).json({

                message: "Error fetching orders"

            });

        }

    }
);


// ===============================
// UPDATE ORDER STATUS
// ADMIN ONLY
// ===============================

app.post(
    "/update-status",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const {
                orderId,
                status
            } = req.body;

            const updated =
                await Order.findByIdAndUpdate(

                    orderId,

                    { status },

                    { new: true }

                );

            io.emit(
                "orderStatusUpdated",
                updated
            );

            console.log(
                "Updated order:",
                updated
            );

            res.json({

                success: true,

                message:
                    "Status updated successfully"

            });

        } catch (error) {

            console.log(
                "ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Status update failed"

            });

        }

    }
);


// ===============================
// DELETE ORDER
// ADMIN ONLY
// ===============================

app.post(
    "/delete-order",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            await Order.findByIdAndDelete(
                req.body.orderId
            );

            res.json({

                success: true,

                message:
                    "Order Deleted Successfully"

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message: "Delete Failed"

            });

        }

    }
);


// ===============================
// MY ORDERS
// ===============================

app.get(
    "/my-orders/:userId",
    authenticateToken,
    async (req, res) => {

        try {

            // User can only access their own orders
            if (
                req.user.id &&
                req.user.id.toString() !==
                req.params.userId.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only access your own orders."

                });

            }

            const orders =
                await Order.find({

                    userId:
                        req.params.userId

                }).sort({

                    createdAt: -1

                });

            res.json(orders);

        } catch (error) {

            console.log(error);

            res.status(500).json({

                message:
                    "Error fetching orders"

            });

        }

    }
);


// ===============================
// UPDATE PAYMENT
// ===============================

app.post(
    "/update-payment",
    authenticateToken,
    async (req, res) => {

        try {

            await Order.findByIdAndUpdate(

                req.body.orderId,

                {
                    paymentStatus: "Paid"
                }

            );

            res.json({

                success: true,

                message:
                    "Payment Updated Successfully"

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message:
                    "Payment Update Failed"

            });

        }

    }
);


// ===============================
// ADD REVIEW
// ===============================

app.post(
    "/add-review",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                orderId,
                rating,
                review
            } = req.body;

            await Order.findByIdAndUpdate(

                orderId,

                {
                    rating,
                    review
                }

            );

            res.json({

                success: true,

                message:
                    "Review Added Successfully"

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed To Add Review"

            });

        }

    }
);


// ===============================
// TRACK ORDER
// ===============================

app.get(
    "/track-order/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const order =
                await Order.findById(
                    req.params.id
                );

            if (!order) {

                return res.status(404).json({

                    message:
                        "Order not found"

                });

            }

            let deliveryTime = "";

            if (
                order.status ===
                "Pending"
            ) {

                deliveryTime =
                    "30 Minutes";

            } else if (
                order.status ===
                "Accepted"
            ) {

                deliveryTime =
                    "25 Minutes";

            } else if (
                order.status ===
                "Preparing"
            ) {

                deliveryTime =
                    "15 Minutes";

            } else if (
                order.status ===
                "Out For Delivery"
            ) {

                deliveryTime =
                    "5 Minutes";

            } else {

                deliveryTime =
                    "Delivered ✅";

            }

            res.json({

                status:
                    order.status,

                deliveryTime:
                    deliveryTime

            });

        } catch (error) {

            res.status(500).json({

                message: "Error"

            });

        }

    }
);


// ===============================
// RESERVE TABLE
// ===============================

app.post(
    "/reserve-table",
    async (req, res) => {

        console.log(
            "================================"
        );

        console.log(
            "Reservation Received:"
        );

        console.log(req.body);

        console.log(
            "================================"
        );

        try {

            const reservation =
                new Reservation({

                    name:
                        req.body.name,

                    phone:
                        req.body.phone,

                    guests:
                        req.body.guests,

                    date:
                        req.body.date,

                    time:
                        req.body.time

                });

            await reservation.save();

            console.log(
                "Reservation Saved Successfully"
            );

            res.json({

                success: true,

                message:
                    "Table Reserved Successfully"

            });

        } catch (error) {

            console.log(
                "Reservation Error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Reservation Failed"

            });

        }

    }
);


// ===============================
// JOB APPLICATIONS
// ===============================

// SUBMIT JOB APPLICATION
// SUBMIT JOB APPLICATION
app.post(
    "/job-application",
    upload.single("cv"),
    async (req, res) => {

        try {

            const application = new JobApplication({

                fullName: req.body.fullName,

                age: req.body.age,

                mobile: req.body.mobile,

                email: req.body.email,

                address: req.body.address,

                jobRole: req.body.jobRole,

                experience: req.body.experience,

                previousCompany:
                    req.body.previousCompany || "",

                expectedSalary:
                    req.body.expectedSalary,

                availability:
                    req.body.availability,

                cv: req.file
                    ? {
                        fileName:
                            req.file.originalname,

                        contentType:
                            req.file.mimetype,

                        data:
                            req.file.buffer
                    }
                    : {},

                additionalMessage:
                    req.body.additionalMessage || ""

            });

            await application.save();

            res.status(201).json({

                success: true,

                message:
                    "Job application submitted successfully"

            });

        } catch (error) {

            console.log(
                "Job Application Error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Job application failed"

            });

        }

    }
);
// ===============================
// DOWNLOAD JOB APPLICATION CV
// ADMIN ONLY
// ===============================

app.get(
    "/job-application/:id/cv",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const application =
                await JobApplication.findById(
                    req.params.id
                );

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found"
                });
            }

            if (
                !application.cv ||
                !application.cv.data
            ) {
                return res.status(404).json({
                    success: false,
                    message: "CV not found"
                });
            }

            res.setHeader(
                "Content-Type",
                application.cv.contentType ||
                "application/octet-stream"
            );

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${application.cv.fileName || "resume"}"`
            );

            res.send(application.cv.data);

        } catch (error) {

            console.log(
                "CV Download Error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Unable to download CV"
            });

        }

    }
);


// GET ALL JOB APPLICATIONS
// ADMIN ONLY
app.get(
    "/job-applications",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const applications =
                await JobApplication
                    .find()
                    .sort({ createdAt: -1 });

            res.json(applications);

        } catch (error) {

            console.log(
                "Job Applications Fetch Error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Error fetching job applications"
            });

        }

    }
);


// UPDATE JOB APPLICATION STATUS
// ADMIN ONLY
app.post(
    "/update-job-application-status",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const {
                applicationId,
                status
            } = req.body;

            const updated =
                await JobApplication.findByIdAndUpdate(
                    applicationId,
                    { status },
                    { new: true }
                );

            if (!updated) {

                return res.status(404).json({
                    success: false,
                    message: "Application not found"
                });

            }

            res.json({
                success: true,
                message: "Application status updated",
                application: updated
            });

        } catch (error) {

            console.log(
                "Job Application Status Error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Status update failed"
            });

        }

    }
);


// ===============================
// GET RESERVATIONS
// ADMIN ONLY
// ===============================

app.get(
    "/reservations",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const reservations =
                await Reservation
                    .find()
                    .sort({
                        createdAt: -1
                    });

            res.json(reservations);

        } catch (error) {

            console.log(error);

            res.status(500).json({

                message:
                    "Error fetching reservations"

            });

        }

    }
);


// ===============================
// UPDATE RESERVATION STATUS
// ADMIN ONLY
// ===============================

app.post(
    "/update-reservation-status",
    authenticateToken,
    adminOnly,
    async (req, res) => {

        try {

            const {
                reservationId,
                status
            } = req.body;

            await Reservation.findByIdAndUpdate(

                reservationId,

                { status }

            );

            res.json({

                success: true,

                message:
                    "Reservation Updated Successfully"

            });

        } catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed To Update Reservation"

            });

        }

    }
);


// ===============================
// START SERVER
// ===============================

// DEMO PAYMENT — NO REAL MONEY
// LOCAL DEMO ONLY — NO REAL PAYMENT
app.post("/demo-payment", async (req, res) => {
    try {
        const { orderId, outcome } = req.body;

        if (!orderId || !["success", "failure"].includes(outcome)) {
            return res.status(400).json({
                success: false,
                message: "Invalid demo payment request"
            });
        }

        const paymentStatus =
            outcome === "success" ? "Paid (Demo)" : "Failed (Demo)";

        const order = await Order.findByIdAndUpdate(
            orderId,
            { paymentStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.json({
            success: outcome === "success",
            paymentStatus,
            orderId: order._id,
            message: outcome === "success"
                ? "Demo payment successful. No money was charged."
                : "Demo payment failed. No money was charged."
        });
    } catch (error) {
        console.error("Demo Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Demo payment could not be processed"
        });
    }
});

server.listen(
    process.env.PORT || 8000,
    () => {

        console.log(
            `Server running on port ${process.env.PORT || 8000
            }`
        );

    }
);
