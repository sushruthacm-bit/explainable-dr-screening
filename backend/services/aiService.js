
const fs = require("fs");
const path = require("path");

async function processRetinalImage(imagePath) {
    try {
        const apiUrl = process.env.AI_API_URL;

        if (!apiUrl) {
            throw new Error("AI_API_URL is missing in .env");
        }

        if (!fs.existsSync(imagePath)) {
            throw new Error("Uploaded image not found.");
        }

        const formData = new FormData();
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBlob = new Blob([imageBuffer]);

        formData.append(
            "image",
            imageBlob,
            path.basename(imagePath)
        );

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 60000);

        let response;

        try {
            response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }

        const responseText = await response.text();

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error(
                `AI API returned invalid JSON. HTTP ${response.status}`
            );
        }

        if (!response.ok) {
            throw new Error(
                result.message ||
                `AI API returned HTTP ${response.status}`
            );
        }

        if (result.status !== "success") {
            throw new Error(
                result.message || "AI processing was not successful."
            );
        }

        return result;

    } catch (error) {
        if (error.name === "AbortError") {
            console.error("AI Service Error: Request timed out.");
            throw new Error("AI API request timed out after 60 seconds.");
        }

        console.error("AI Service Error:", error.message);
        throw error;
    }
}

module.exports = { processRetinalImage };
