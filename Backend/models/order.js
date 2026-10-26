const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customer: String,
    phone: String,
    userId: String,
    address: String,
    cart: Array,
    paymentMethod: {
    type: String,
    default: "COD"
},

paymentStatus: {
    type: String,
    default: "Pending"
},
paymentId: {
    type: String,
    default: null,
    index: true
},
totalPaise: {
    type: Number,
    default: 0
},
    status: {
        type: String,
        default: "Pending"
    },
    rating: {
    type: Number,
    default: 0
},

review: {
    type: String,
    default: ""
}
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
