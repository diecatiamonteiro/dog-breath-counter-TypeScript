import express from "express";
import checkToken from "../middleware/checkToken";
import {
  createBreathingLog,
  deleteBreathingLogById,
  getAllBreathingLogs,
  getBreathingLogById,
} from "../controllers/breathingLogController";

// Create a new router
const breathingLogRouter = express.Router();

// All routes are protected, ie require a valid JWT token, ie user must be logged in
breathingLogRouter
  .post("/", checkToken, createBreathingLog)
  .get("/", checkToken, getAllBreathingLogs)
  .get("/:logId", checkToken, getBreathingLogById)
  .delete("/:logId", checkToken, deleteBreathingLogById);

export default breathingLogRouter;
