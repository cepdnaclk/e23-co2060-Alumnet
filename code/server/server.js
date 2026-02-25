const express = require("express");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ CORS (local + deployed)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// ✅ Health check for Render
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/", (req, res) => {
  res.send("Alumnet API is running 🚀");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});