import express from "express";
import checkToken from "../middleware/checkToken";
import {
  createBreathingLog,
  deleteBreathingLogById,
  getAllBreathingLogs,
  getBreathingLogById,
} from "../controllers/breathingLogController";

// Create a new router with mergeParams to access parent route params (dogId)
const breathingLogRouter = express.Router({ mergeParams: true });

// All routes are protected, ie require a valid JWT token, ie user must be logged in
// These routes will be mounted at /api/dogs/:id/breathing-logs
breathingLogRouter
  .post("/", checkToken, createBreathingLog)
  .get("/", checkToken, getAllBreathingLogs)
  .get("/:logId", checkToken, getBreathingLogById)
  .delete("/:logId", checkToken, deleteBreathingLogById);

export default breathingLogRouter;
