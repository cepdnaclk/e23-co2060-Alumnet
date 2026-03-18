const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const directoryRoutes = require("./routes/directoryRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/mentorship-requests", mentorshipRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
  res.send("Alumnet API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
