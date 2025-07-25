/**
 * @file index.ts
 * @description Main file for the backend.
 *              It initializes the Express app, connects to the database, and starts the server.
 *              It also handles CORS, error handling, and other middleware.
 */

import express, { Request, Response } from "express";
import "dotenv/config";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
  globalErrorHandler,
  RouteNotFoundError,
} from "./middleware/errorHandler";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import dogRouter from "./routes/dogRoutes";

// Initialize Express
export const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000", // development client
  "http://localhost:5000", // development server
  "https://pawpulse-breathcounter.vercel.app", // production - Vercel domain
  // Add other allowed domains
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  })
);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from the backend!" });
});

// Mount API routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/dogs", dogRouter);
// Note: breathing log routes are now nested under dog routes

// Error handling middleware
app.use(RouteNotFoundError);
app.use(globalErrorHandler);

// Type for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_URI: string;
      JWT_SECRET: string;
      NODE_ENV: "development" | "production" | "test";
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_REDIRECT_URI?: string;
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
      NEXT_PUBLIC_CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: string;
      // Add other env variables used in the project
    }
  }
}

// Start the server
const port = process.env.PORT || 8000;

// Error handling for the server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
      console.log("✅ CORS enabled for origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
