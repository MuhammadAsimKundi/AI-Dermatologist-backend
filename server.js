const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const session = require("express-session"); // ✅ Added session support
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  // "http://localhost:3000",
  "https://ai-dermatologist-frontend-iota.vercel.app/" // ✅ Updated to allow frontend access
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true); // ✅ Cleaner check with includes()
    return callback(new Error(`CORS not allowed for: ${origin}`), false);
  },
  credentials: true, // ✅ Allow cookies/credentials over CORS
}));

// app.use(session({
//   secret: "yourSecret", // ✅ Required for cookie-based sessions
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: false,      // ✅ Set to false for local/dev use (true for HTTPS)
//     sameSite: "lax",    // ✅ Allow cross-origin but still somewhat restricts CSRF
//   },
// }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const detectionHistoryRoutes = require("./routes/detectionHistoryRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/detection-history", detectionHistoryRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...Backend Started");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
