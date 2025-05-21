import express from "express";
import checkToken from "../middleware/checkToken";
import { deleteUser, getUser, updateUser } from "../controllers/userController";

// Create a new router
const userRouter = express.Router();

userRouter
  .get("/me", checkToken, getUser)
  .delete("/me", checkToken, deleteUser)
  .patch("/me", checkToken, updateUser); // to be implemented later

export default userRouter;
