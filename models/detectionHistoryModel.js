// models/detectionHistoryModel.js
const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    dosage:      { type: String, required: true },
    usage:       { type: String, required: true },
    precautions: { type: String, required: true },
    suggestedBy: { type: String, enum: ["AI", "Dermatologist"], default: "AI" },
  },
  { _id: false }
);

const detectionHistorySchema = new mongoose.Schema(
  {
    patientId:       { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    imageUrl:        { type: String, required: true },
    detectedDisease: { type: String, required: true },
    confidence:      { type: String, default: "Unknown" },
    medicines:       { type: [medicineSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DetectionHistory", detectionHistorySchema);
