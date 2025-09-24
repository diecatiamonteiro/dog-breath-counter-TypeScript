/**
 * @file server/src/types/express.d.ts
 * @description Type declarations for Express request objects.
 *              This file extends the Request interface to include user and isAuthenticated properties.
 */

import { Request } from "express";
import { IUser } from "../models/User";

declare global {
  namespace Express {
    // Extend the Request interface to include cookies property
    interface Request {
      cookies: {
        [key: string]: string;
      };
    }

    // Extend the Request interface to include user and isAuthenticated properties
    interface Request {
      user?: IUser;
      isAuthenticated?: boolean;
    }
  }
}

// Export the type for explicit imports
export type AuthenticatedRequest = Express.AuthenticatedRequest;
