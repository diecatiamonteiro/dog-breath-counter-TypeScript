/**
 * @file server/src/middleware/validatePhoto.ts
 * @description Middleware to validate Cloudinary photo data in the request body.
 *              This middleware ensures that:
 *                 - If `req.body.photo` is present, it must include a valid `url` and `publicId`.
 *                 - The `url` must be a proper Cloudinary URL.
 *                 - The `publicId` must be a non-empty string without spaces.
 *              If no photo is provided, the request continues without error (photo is optional).
 */

import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { CloudinaryPhoto } from "../types/cloudinary";

export const validatePhotoData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const photo = req.body.photo as CloudinaryPhoto | undefined;

    // If no photo data is provided, continue (photo is optional)
    if (!photo) {
      return next();
    }

    // Validate photo object structure
    if (!photo.url || !photo.publicId) {
      throw createError(400, "Invalid photo data structure");
    }

    // Validate URL format
    try {
      new URL(photo.url);
    } catch {
      throw createError(400, "Invalid photo URL");
    }

    // Validate Cloudinary URL
    if (!photo.url.includes("res.cloudinary.com")) {
      throw createError(400, "Invalid Cloudinary URL");
    }

    // Validate publicId format (non-empty string without spaces)
    if (
      typeof photo.publicId !== "string" ||
      !photo.publicId.trim() ||
      photo.publicId.includes(" ")
    ) {
      throw createError(400, "Invalid public ID format");
    }

    next();
  } catch (error) {
    next(error);
  }
};
