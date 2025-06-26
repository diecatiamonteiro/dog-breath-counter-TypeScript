import express from "express";
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
  .get("/logout", logout) // no checkToken - users should be able to logout without authentication
  .post("/forgot-password", forgotPassword)
  .post("/reset-password/:token", resetPassword);

export default authRouter;
