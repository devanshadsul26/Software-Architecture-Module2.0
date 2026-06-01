const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const courseRoutes = require("./routes/courseRoute");
const { correlationIdMiddleware } = require("../correlationId");
const { courseServiceLogger } = require("../logging");

dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(correlationIdMiddleware);
app.use(express.json());

app.use("/api/courses", courseRoutes);

// Start server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  courseServiceLogger.info(`Course Server running on port ${PORT}`);
});
