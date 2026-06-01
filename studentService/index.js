const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const studentRoute = require("./routes/studentRoute");
const { correlationIdMiddleware } = require("../correlationId");
const { studentServiceLogger } = require("../logging");

dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(correlationIdMiddleware);
app.use(express.json());

app.use("/api/students", studentRoute);

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  studentServiceLogger.info(`Student Server running on port ${PORT}`);
});
