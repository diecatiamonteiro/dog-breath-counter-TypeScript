/**
 * @file server/src/types/controller.d.ts (d = type declaration file)
 * @description Shared Controller type for Express route handlers.
 *              This type is used to avoid repeating (req, res, next) in all controller functions.
 */

import { Request, Response, NextFunction } from "express";

export type Controller<T = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void>;
