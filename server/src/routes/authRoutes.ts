import express from "express";
import checkToken from "../middleware/checkToken";
import {
  forgotPassword,
  login,
  loginGoogle,
  logout,
  register,
  resetPassword,
} from "../controllers/authController";
import {
  validateLoginRequest,
  validateRegisterRequest,
} from "../middleware/validateRequest";

// Create a new router
const authRouter = express.Router();

authRouter
  .post("/register", validateRegisterRequest, register) 
  .post("/login", validateLoginRequest, login)
  .post("/login/google", loginGoogle)
  .get("/logout", checkToken, logout) // protected route
  .post("/forgot-password", forgotPassword)
  .post("/reset-password/:token", resetPassword);

export default authRouter;
