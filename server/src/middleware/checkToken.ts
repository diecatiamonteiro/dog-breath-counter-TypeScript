/**
 * @file server/src/middleware/checkToken.ts
 * @description Middleware to check if the user is authenticated
 */

import { AuthenticatedRequest } from "../types/express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import User from "../models/User";
import { Controller } from "../types/controller";

// Define JwtPayload interface for the decoded token
interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

const checkToken: Controller<AuthenticatedRequest> = async (req, res, next) => {
  // Get the JWT token from the cookies
  const jwtToken = req.cookies?.jwtToken;
  if (!jwtToken) {
    return next(createError(401, "Unauthorized request, no token provided"));
  }

  // Verify if the JWT token is valid and, if yes, decode its payload (eg: { id: '123', iat: ..., exp: ... })
  let decoded: JwtPayload;
  const secret = process.env.JWT_SECRET || "test-secret";

  try {
    decoded = jwt.verify(jwtToken, secret) as JwtPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return next(createError(401, "Invalid or expired token"));
  }

  // Find the user by the ID extracted from the token
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(createError(401, "User not found"));
  }

  // Attach the user and isAuthenticated properties to the request
  // Use _id instead of id since that's what Mongoose provides
  req.user = user;
  req.isAuthenticated = true;

  next();
};

export default checkToken;
