const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const enrollmentRoutes = require("./routes/enrollmentRoute");

const publicKeyRoute = require("./routes/auth/publicKeyRoute");
const { correlationIdMiddleware } = require("../correlationId");
const { enrollementServiceLogger } = require("../logging");

dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(correlationIdMiddleware);
app.use(express.json());

app.use("/.well-known/jwks.json", publicKeyRoute);
app.use("/api/enrollments", enrollmentRoutes);

// Start server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  enrollementServiceLogger.info(`Enrollment running on port ${PORT}`);
});
