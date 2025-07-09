import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { errorMiddleware } from "@packages/error-handler/error-middleware";
import router from "./routes/auth.route";

const swaggerDocument = require("./swagger-output.json");

const app = express();

// CORS configuration: allow requests from frontend
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Health check route
app.get("/health", (_, res) => {
  res.json({ message: "Hello API" });
});

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (_, res) => {
  res.json(swaggerDocument);
});

// API routes
app.use("/", router);

// Global error handler
app.use(errorMiddleware);

// Determine port
const port = parseInt(process.env.PORT || "6001", 10);

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Auth service running at: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at:      http://localhost:${port}/api-docs`);
});

// Listen for low-level server errors
server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("❌ Server error:", err.stack || err.message);
});
