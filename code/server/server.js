const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const directoryRoutes = require("./routes/directoryRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const eventRoutes = require("./routes/eventRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

const corsOptions = {
  origin: "https://e23-co2060-alumnet.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/mentorship-requests", mentorshipRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Alumnet API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
