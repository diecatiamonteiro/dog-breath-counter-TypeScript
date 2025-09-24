/**
 * @file server/src/services/cloudinaryService.ts
 * @description Cloudinary service for handling photo operations
 */

import cloudinary from "../config/cloudinary";
import { CloudinaryError } from "../types/cloudinary";
import createError from "http-errors";
import path from "path";

const uploadLogo = async () => {
  try {
    // Path to logo in public folder
    const logoPath = path.join(__dirname, '../../../client/public/logos/logo-light.png');

    // Upload logo to Cloudinary
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'paw-pulse-logos',
      public_id: 'logo-light',
      overwrite: true,
      resource_type: 'image',
    });
  } catch (error) {
    console.error('Error uploading logo to Cloudinary:', error);
  }
}

uploadLogo();

class CloudinaryService {
  /**
   * Deletes a photo from Cloudinary
   * @param publicId - The public ID of the photo to delete
   * @throws {Error} If deletion fails
   */
  async deletePhoto(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      // Treat "not found" as a non-fatal outcome since the resource might have already been deleted or never existed with that ID.
      if (result.result !== "ok" && result.result !== "not found") {
        throw createError(500, `Failed to delete photo: ${result.result}`);
      }
    } catch (error) {
      const cloudinaryError = error as CloudinaryError;
      throw createError(
        cloudinaryError.http_code || 500,
        `Cloudinary deletion error: ${cloudinaryError.message}`
      );
    }
  }

  /**
   * Cleanup function to be used in error cases
   * @param photo - The photo to cleanup
   */
  async cleanup(photo: { publicId: string }): Promise<void> {
    try {
      await this.deletePhoto(photo.publicId);
    } catch (error) {
      console.error("Cleanup failed:", error);
      // Don't throw here as this is cleanup code
    }
  }
}

export const cloudinaryService = new CloudinaryService();
