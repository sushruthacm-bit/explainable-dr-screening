
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        screening: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Screening",
            required: true,
            unique: true
        },

        reportFilename: {
            type: String,
            required: true
        },

        reportPath: {
            type: String,
            required: true
        },

        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Report", reportSchema);
