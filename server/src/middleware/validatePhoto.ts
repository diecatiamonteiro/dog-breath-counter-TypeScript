/**
 * @file validatePhoto.ts
 * @description Middleware to validate photo data
 */

import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { CloudinaryPhoto } from '../types/cloudinary';

export const validatePhotoData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const photo = req.body.photo as CloudinaryPhoto | undefined;

    // If no photo data is provided, it's optional so continue
    if (!photo) {
      return next();
    }

    // Validate photo object structure
    if (!photo.url || !photo.publicId) {
      throw createError(400, 'Invalid photo data structure');
    }

    // Validate URL format
    try {
      new URL(photo.url);
    } catch {
      throw createError(400, 'Invalid photo URL');
    }

    // Validate Cloudinary URL
    if (!photo.url.includes('res.cloudinary.com')) {
      throw createError(400, 'Invalid Cloudinary URL');
    }

    // Validate publicId format (non-empty string without spaces)
    if (typeof photo.publicId !== 'string' || !photo.publicId.trim() || photo.publicId.includes(' ')) {
      throw createError(400, 'Invalid public ID format');
    }

    next();
  } catch (error) {
    next(error);
  }
}; 