
const mongoose = require("mongoose");

const screeningSchema = new mongoose.Schema(
    {
        imageFilename: {
            type: String,
            required: true
        },

        imagePath: {
            type: String,
            required: true
        },

        predictedGrade: {
            type: Number,
            min: 0,
            max: 4,
            default: null
        },

        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: null
        },

        reviewStatus: {
            type: String,
            enum: ["pending", "needs_review", "reviewed"],
            default: "pending"
        },

        processingStatus: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending"
        },

        modelVersion: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Screening", screeningSchema);
