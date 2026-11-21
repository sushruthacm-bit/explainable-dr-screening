
const fs = require("fs");
const path = require("path");

const gradcamDirectory = path.join(__dirname, "../gradcam");

if (!fs.existsSync(gradcamDirectory)) {
    fs.mkdirSync(gradcamDirectory, { recursive: true });
}

function saveGradcamImage(base64Data, filename) {
    if (!base64Data || typeof base64Data !== "string") {
        throw new Error("Valid Grad-CAM image data is required.");
    }

    // Remove optional Base64 data URL prefix
    const cleanBase64 = base64Data.replace(
        /^data:image\/png;base64,/,
        ""
    );

    const imageBuffer = Buffer.from(cleanBase64, "base64");

    // Verify PNG file signature
    const pngSignature = Buffer.from([
        0x89, 0x50, 0x4E, 0x47,
        0x0D, 0x0A, 0x1A, 0x0A
    ]);

    if (
        imageBuffer.length < 8 ||
        !imageBuffer.subarray(0, 8).equals(pngSignature)
    ) {
        throw new Error("Invalid PNG image data.");
    }

    const safeFilename = path.basename(filename);

    if (!safeFilename.endsWith(".png")) {
        throw new Error("Grad-CAM filename must end in .png.");
    }

    const filePath = path.join(gradcamDirectory, safeFilename);

    fs.writeFileSync(filePath, imageBuffer);

    return `gradcam/${safeFilename}`;
}

module.exports = { saveGradcamImage };
