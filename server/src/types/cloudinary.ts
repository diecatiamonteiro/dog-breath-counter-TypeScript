/**
 * @file cloudinary.ts
 * @description TypeScript interfaces for Cloudinary operations
 */

export interface CloudinaryPhoto {
  url: string;
  publicId: string;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder: string;
}

export interface CloudinaryError {
  message: string;
  http_code: number;
  name: string;
} 