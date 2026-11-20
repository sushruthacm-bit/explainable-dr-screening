
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const screeningRoutes = require("./routes/screeningRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/screenings", screeningRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Diabetic Retinopathy Screening Backend is running!"
    });
});

// Health check route
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend is working properly"
    });
});

// Connect to MongoDB
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

startServer();
