const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const directoryRoutes = require("./routes/directoryRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const eventRoutes = require("./routes/eventRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/mentorship-requests", mentorshipRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/chat", chatRoutes);

app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Alumnet API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const sendEmail = require("./utils/sendEmail");

app.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Alumnet test email",
      html: "<h2>Email sending works ✅</h2>",
    });

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email test error:", error);
    res.status(500).json({ message: "Email failed", error: error.message });
  }
});
