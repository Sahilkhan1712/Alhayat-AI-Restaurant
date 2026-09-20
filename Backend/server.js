
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");


require("dotenv").config();


const authRoutes = require("./routes/auth");

const Order = require("./models/Order");
const Reservation = require("./models/Reservation");

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

        const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        model: "gemma3:4b",
        messages: conversation,
        stream: false
    })
});

const data = await response.json();

if (!response.ok) {
    throw new Error(data.error || "Ollama AI error");
}

const reply = data.message?.content || "Sorry, AI could not generate a response.";

   


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

app.post("/place-order", async (req, res) => {

    console.log("Order Received:", req.body);

    try {

        const newOrder = new Order(req.body);

        await newOrder.save();

        res.json({

            success: true,

            message: "Order saved successfully",

            orderId: newOrder._id

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Order not saved"

        });

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

server.listen(
    process.env.PORT || 8000,
    () => {

        console.log(
            `Server running on port ${
                process.env.PORT || 8000
            }`
        );

    }
);