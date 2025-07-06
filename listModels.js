// listModels.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    for (const model of data.models) {
      console.log(`🔹 ${model.name} — ${model.supportedGenerationMethods?.join(", ")}`);
    }
  } catch (err) {
    console.error("❌ Failed to list models:", err.message);
  }
}

listModels();
