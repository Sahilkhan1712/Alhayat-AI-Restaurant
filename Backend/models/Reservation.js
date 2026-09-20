const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
{
    name: String,
    phone: String,
    guests: Number,
    date: String,
    time: String,
    status: {
        type: String,
        default: "Booked"
    }
},
{
    timestamps: true
}
);

module.exports =
    mongoose.model(
        "Reservation",
        reservationSchema
    );