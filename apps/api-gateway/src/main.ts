/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from "express";
import * as path from "path";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import axios from "axios";
import cookieParser from "cookie-parser";

const app = express();

// Enable CORS for requests coming from localhost:3000
app.use(
  cors({
    origin: ["http://localhost:3000"], // allow frontend origin
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true, // allow sending cookies & auth headers
  })
);

// HTTP request logger middleware in 'dev' format
app.use(morgan("dev"));

// Parse incoming JSON requests with large payloads
app.use(express.json({ limit: "100mb" }));

// Parse URL-encoded bodies (e.g., form submissions)
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Parse Cookie header and populate req.cookies
app.use(cookieParser());

// Tell Express to trust the reverse proxy (e.g., for secure cookies)
app.set("trust proxy", 1);

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // higher limit for authenticated users
  message: { error: "Too many requests, please try again later!" },
  standardHeaders: true, // send RateLimit-* headers
  legacyHeaders: true, // also send X-RateLimit-* headers
  keyGenerator: (req: any) => req.ip, // rate limit by IP
});
app.use(limiter);

// Serve static assets if needed
// app.use("/assets", express.static(path.join(__dirname, "assets")));

// Simple health check endpoint for the gateway
app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

// Proxy all requests to the backend service running on port 6001
app.use("/", proxy("http://localhost:6001"));

// Start the server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

// Log server errors
server.on("error", console.error);
