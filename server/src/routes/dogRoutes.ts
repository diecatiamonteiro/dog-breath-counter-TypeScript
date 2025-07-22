import express from "express";
import checkToken from "../middleware/checkToken";
import { validatePhotoData } from "../middleware/validatePhoto";
import {
  createDog,
  deleteDog,
  getAllDogs,
  getDogById,
  updateDog,
} from "../controllers/dogController";
import breathingLogRouter from "./breathingLogRoutes";

// Create a new router
const dogRouter = express.Router();

// All routes are protected, ie require a valid JWT token, ie user must be logged in
dogRouter
  .get("/", checkToken, getAllDogs)
  .post("/", checkToken, validatePhotoData, createDog)
  .get("/:id", checkToken, getDogById)
  .patch("/:id", checkToken, validatePhotoData, updateDog)
  .delete("/:id", checkToken, deleteDog);

// Mount breathing log routes as nested routes under dogs
// This will create routes like /api/dogs/:dogId/breathing-logs
dogRouter.use("/:id/breathing-logs", breathingLogRouter);

export default dogRouter;
