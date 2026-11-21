const express = require("express");
const Patient = require("../models/Patient");
const Screening = require("../models/Screening");

const router = express.Router();

// Register a new patient
router.post("/", async (req, res) => {
    try {
        const { name, age, gender } = req.body;

        if (!name || age === undefined || age === null) {
            return res.status(400).json({
                success: false,
                message: "Name and age are required."
            });
        }

        const patientId =
            "DR" + Date.now() + Math.floor(100 + Math.random() * 900);

        const patient = await Patient.create({
            patientId,
            name,
            age,
            gender
        });

        res.status(201).json({
            success: true,
            message: "Patient registered successfully.",
            patient
        });

    } catch (error) {
        console.error("Patient registration error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to register patient."
        });
    }
});

// Get patient using Patient ID
router.get("/:patientId", async (req, res) => {
    try {
        const patient = await Patient.findOne({
            patientId: req.params.patientId
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.status(200).json({
            success: true,
            patient
        });

    } catch (error) {
        console.error("Patient lookup error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve patient."
        });
    }
});

// Get all screening records for a patient
router.get("/:patientId/history", async (req, res) => {
    try {
        const patient = await Patient.findOne({
            patientId: req.params.patientId
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        const screenings = await Screening.find({
            patient: patient._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            patientId: patient.patientId,
            patientName: patient.name,
            totalScreenings: screenings.length,
            screenings
        });

    } catch (error) {
        console.error("History error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve screening history."
        });
    }
});

module.exports = router;