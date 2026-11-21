
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Report = require("../models/Report");
const Patient = require("../models/Patient");
const Screening = require("../models/Screening");

const router = express.Router();

// Create reports folder if it does not exist
const reportsDirectory = path.join(__dirname, "../reports");

if (!fs.existsSync(reportsDirectory)) {
    fs.mkdirSync(reportsDirectory, { recursive: true });
}

// Configure PDF storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, reportsDirectory);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            "DR_Report_" + Date.now() + ".pdf";

        cb(null, uniqueName);
    }
});

// Accept PDF files only
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "application/pdf" &&
        path.extname(file.originalname).toLowerCase() === ".pdf"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF reports are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// Upload generated PDF and save report details
router.post("/upload", upload.single("report"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF report."
            });
        }

        const { patientId, screeningId } = req.body;

        if (!patientId || !screeningId) {
            fs.unlinkSync(req.file.path);

            return res.status(400).json({
                success: false,
                message: "Patient ID and Screening ID are required."
            });
        }

        const patient = await Patient.findOne({ patientId });

        if (!patient) {
            fs.unlinkSync(req.file.path);

            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        const screening = await Screening.findOne({
            _id: screeningId,
            patient: patient._id
        });

        if (!screening) {
            fs.unlinkSync(req.file.path);

            return res.status(404).json({
                success: false,
                message: "Screening not found for this patient."
            });
        }

        const existingReport = await Report.findOne({
            screening: screening._id
        });

        if (existingReport) {
            fs.unlinkSync(req.file.path);

            return res.status(409).json({
                success: false,
                message: "A report already exists for this screening."
            });
        }

        const report = await Report.create({
            patient: patient._id,
            screening: screening._id,
            reportFilename: req.file.filename,
            reportPath: `reports/${req.file.filename}`
        });

        res.status(201).json({
            success: true,
            message: "PDF report saved successfully.",
            report
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error("Report upload error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to save PDF report."
        });
    }
});


// Get all reports belonging to a patient
router.get("/patient/:patientId", async (req, res) => {
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

        const reports = await Report.find({
            patient: patient._id
        })
            .populate("screening")
            .sort({ generatedAt: -1 });

        res.status(200).json({
            success: true,
            totalReports: reports.length,
            reports
        });

    } catch (error) {
        console.error("Patient reports error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve patient reports."
        });
    }
});



// Get report details using Report ID
router.get("/:reportId", async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId)
            .populate("patient")
            .populate("screening");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Report retrieved successfully.",
            report
        });

    } catch (error) {
        console.error("Report retrieval error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve report."
        });
    }
});


 // Download PDF report using Report ID
router.get("/:reportId/download", async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        const filePath = path.join(
            __dirname,
            "..",
            report.reportPath
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "PDF file not found."
            });
        }

        res.download(filePath, report.reportFilename);

    } catch (error) {
        console.error("PDF download error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to download PDF report."
        });
    }
});


module.exports = router;
