const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

const publicKeyRoute = require("./routes/auth/publicKeyRoute");
const loginRoute = require("./routes/auth/loginRoute");
const { correlationIdMiddleware } = require("../correlationId");
const { authServiceLogger } = require("../logging");

dotenv.config();

// Initialize express app
const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 10, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  headers: true, // Include rate limit info in response headers
});

// Middleware
app.use(correlationIdMiddleware);
app.use(express.json());
app.use("/api/login", limiter);

// Public Key
app.use("/.well-known/jwks.json", publicKeyRoute);

// Routes
app.use("/api/login", loginRoute);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  authServiceLogger.info(`Auth Server running on port ${PORT}`);
});
