import express from "express";
import checkToken from "../middleware/checkToken";
import {
  createDog,
  deleteDog,
  getAllDogs,
  getDogById,
  updateDog,
} from "../controllers/dogController";

// Create a new router
const dogRouter = express.Router();

// All routes are protected, ie require a valid JWT token, ie user must be logged in
dogRouter
  .get("/", checkToken, getAllDogs)
  .post("/", checkToken, createDog)
  .get("/:id", checkToken, getDogById)
  .patch("/:id", checkToken, updateDog)
  .delete("/:id", checkToken, deleteDog);

export default dogRouter;
