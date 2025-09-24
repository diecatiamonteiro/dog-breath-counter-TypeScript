/**
 * @file server/src/config/cloudinary.ts
 * @description Cloudinary configuration file: initializes and exports
 *              the Cloudinary instance with environment-based configuration.
 *              This instance is used across the backend to upload, delete,
 *              or manage media assets.
 */

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

export default cloudinary;
