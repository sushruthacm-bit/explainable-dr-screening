
const express = require("express");
const multer = require("multer");
const path = require("path");
const Screening = require("../models/Screening");

const router = express.Router();

// Configure image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
    }
});

// Accept only common image formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG and PNG images are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Upload an image and create a screening record
router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a retinal image."
            });
        }

        const screening = await Screening.create({
            imageFilename: req.file.filename,
            imagePath: `uploads/${req.file.filename}`,
            processingStatus: "pending",
            reviewStatus: "pending"
        });

        res.status(201).json({
            success: true,
            message: "Image uploaded and screening record created.",
            screening
        });
    } catch (error) {
        console.error("Upload error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to save the screening record."
        });
    }
});

module.exports = router;
