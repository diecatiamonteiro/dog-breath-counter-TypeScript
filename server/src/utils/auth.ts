/**
 * @file auth.ts
 * @description Utility functions for handling authentication (JWT token creation & cookie setting)
 */

import jwt from "jsonwebtoken";
import { Response } from "express";
import { IUser } from "../models/User";

/**
 * @desc   Create JWT token and set secure HTTP-only cookie (used for register & login)
 * @param  {IUser} user - The user object (from MongoDB)
 * @param  {Response} res - Express response object
 */
export const setAuthCookie = (user: IUser, res: Response): void => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "fallback-secret-key",
    { expiresIn: "7d" }
  );

  res.cookie("jwtToken", token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "none", // Required for cross-domain cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * @desc   Clear auth cookie (used for logout)
 * @param  {Response} res - Express response object
 */
export const clearAuthCookie = (res: Response): void => {
  res.cookie("jwtToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
  });
};
