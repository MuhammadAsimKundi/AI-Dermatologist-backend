require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const prompt = `Suggest 1 over-the-counter medicine for acne. Return JSON like:
[
  {
    "name": "Medicine name",
    "dosage": "How to take it",
    "usage": "Instructions",
    "precautions": "Precaution"
  }
]`;

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" }); // ✅ known working model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log("✅ Gemini Response:", text);
  } catch (err) {
    console.error("❌ Gemini Test Failed:", err.message);
  }
}

run();
