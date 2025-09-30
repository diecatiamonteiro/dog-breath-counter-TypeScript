/**
 * @file PetPhotoUploader.tsx
 * @description Cloudinary upload widget component
 *              Allows user to upload pet photos
 *              onto pet profile page
 */

"use client";

import { CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useState } from "react";
import Image from "next/image";
import { FaCamera, FaTrash } from "react-icons/fa";
import Button from "./Button";

interface PhotoData {
  url: string;
  publicId: string;
}

interface PetPhotoUploaderProps {
  currentPhoto?: PhotoData;
  onUpload?: (photo: PhotoData) => void;
  onError?: (error: string) => void;
  onRemove?: () => void;
}

export const PetPhotoUploader: React.FC<PetPhotoUploaderProps> = ({
  currentPhoto,
  onUpload,
  onError,
  onRemove,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (results: CloudinaryUploadWidgetResults) => {
    try {
      setIsUploading(true);

      if (results.info && typeof results.info !== "string") {
        const photoData: PhotoData = {
          url: results.info.secure_url,
          publicId: results.info.public_id,
        };

        onUpload?.(photoData);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onRemove?.();
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      {/* Photo Preview */}
      {currentPhoto && (
        <div className="relative">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
            <Image
              src={currentPhoto.url}
              alt="Dog photo"
              fill
              className="object-cover"
            />
          </div>

          {/* Remove button */}
          <Button
            size="sm"
            onClick={handleRemove}
            variant="danger"
            ariaLabel="Delete dog photo"
            icon={<FaTrash className="w-4 h-4" aria-hidden="true" />}
            iconOnly
            shape="circle"
            className="absolute -top-2 -right-2"
          />
        </div>
      )}

      {/* Upload Button */}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pet-photos"}
        onSuccess={handleUpload}
        options={{
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["png", "jpeg", "jpg"],
          maxFileSize: 1500000, // 1.5MB
        }}
      >
        {({ open }) => (
          <Button
            onClick={() => open()}
            variant="secondary"
            size="sm"
            disabled={isUploading}
            icon={<FaCamera className="w-4 h-4" aria-hidden="true" />}
          >
            {" "}
            {isUploading
              ? "Uploading..."
              : currentPhoto
              ? "Change Photo"
              : "Upload Photo"}
          </Button>
        )}
      </CldUploadWidget>

      {!currentPhoto && (
        <div className="text-center">
          <p className="text-sm text-foreground/70">
            Click to upload a photo of your dog
          </p>
          <p className="text-xs text-foreground/50">JPG, PNG • Max 1.5MB</p>
        </div>
      )}
    </div>
  );
};
