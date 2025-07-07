const DetectionHistory = require("../models/detectionHistoryModel");
const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const sharp = require("sharp");
const askGemini = require("../utils/gemini");

const uploadDetectionImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const patientId = req.user.id;
    const clRes = await cloudinary.uploader.upload(req.file.path);
    const imageUrl = clRes.secure_url;
    console.log("✅ Cloudinary upload:", imageUrl);

    let detectedDisease = "Unknown";
    let confidence = "0%";
    let medicines = [];
    let compressedPath = null;

    try {
      compressedPath = `uploads/compressed_${Date.now()}.jpg`;
      await sharp(req.file.path)
        .resize({ width: 300, height: 300 })
        .jpeg({ quality: 70 })
        .toFile(compressedPath);

      const formData = new FormData();
      formData.append("image", fs.createReadStream(compressedPath));

      console.log("🚀 Sending image to ML model…");
      const mlRes = await axios.post(
        process.env.ML_API_URL || "https://web-production-7ea7.up.railway.app/predict",
        formData,
        { headers: formData.getHeaders(), timeout: 60000 }
      );

      console.log("🧠 ML model response:", mlRes.data);

      if (mlRes.data?.prediction) {
        detectedDisease = mlRes.data.prediction;
        confidence = mlRes.data.confidence || "Unknown";

        // Gemini AI Integration
        try {
          const prompt = `Suggest 2 detailed over-the-counter medicines for the skin condition "${detectedDisease}".
Return ONLY raw JSON in this format (without any explanation or markdown):

[
  {
    "name": "Commercial name (include formula/ingredient)",
    "dosage": "How much and how often to apply or take",
    "usage": "Step-by-step application or intake method",
    "precautions": "Detailed warnings, e.g., when not to use or consult a doctor"
  }
]

Respond strictly with JSON only, no extra text.`;

          const raw = await askGemini(prompt);
          console.log("🧪 Gemini raw response:", raw);

          let jsonText = raw;

          // Clean any wrapping ```json code block if present
          if (!jsonText.trim().startsWith("[")) {
            jsonText = raw.replace(/```(json)?/g, "").trim();
            console.warn("⚠️ Gemini response cleaned from markdown.");
          }

          try {
            medicines = JSON.parse(jsonText);
            console.log("✅ Parsed medicines:", medicines);
          } catch (jsonErr) {
            console.error("❌ JSON parse failed:", jsonErr.message);
            medicines = [];
          }

        } catch (aiErr) {
          console.error("⚠️ Gemini call failed:", aiErr.message);
          medicines = [];
        }
      }
    } catch (mlErr) {
      console.error("❌ ML pipeline failed:", mlErr.message);
    } finally {
      if (compressedPath) fs.unlink(compressedPath, () => {});
    }

    const detection = await DetectionHistory.create({
      patientId,
      imageUrl,
      detectedDisease,
      confidence,
      medicines,
    });

    res.status(201).json({
      message: "Image processed, disease detected, medicine advice generated",
      detection,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const saveDetectionResult = async (req, res) => {
  try {
    const { patientId, imageUrl, detectedDisease, confidence } = req.body;
    if (!patientId || !imageUrl || !detectedDisease) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const history = await DetectionHistory.create({
      patientId,
      imageUrl,
      detectedDisease,
      confidence: confidence || "Unknown",
    });

    res.status(201).json({ message: "Detection history saved", data: history });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getDetectionHistory = async (req, res) => {
  try {
    const history = await DetectionHistory.find({ patientId: req.user.id });
    if (!history.length) {
      return res.status(404).json({ message: "No past detections found" });
    }
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  uploadDetectionImage,
  saveDetectionResult,
  getDetectionHistory,
};
