/**
 * @file server/src/middleware/errorHandler.ts
 * @description Middleware to handle errors
 */

import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

export const RouteNotFoundError = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return next(createError(404, "Route not found"));
};

// Error is a built-in global type in JS & TS
/*
  class Error {
  name: string;
  message: string;
  stack?: string;
}
*/
interface CustomError extends Error {
  status?: number;
}

export const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.status || 500).json({
    statusCode: err.status || 500,
    message: err.message || "Internal Server Error",
  });
};
