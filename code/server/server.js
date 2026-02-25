const express = require("express");
const cors = require("cors");
const eventRoutes = require('./eventRoutes');
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/events', eventRoutes);

app.get("/", (req, res) => {
  res.send("Alumnet API is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
