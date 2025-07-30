/**
 * @file PetPhotoUploader.tsx
 * @description Cloudinary upload widget component for user to upload pet photos
 */

"use client"; // this component runs on the browser, not on the server

import { CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useState } from "react";
import Image from "next/image";
import { FaCamera, FaTrash } from "react-icons/fa";

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
  onRemove
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (results: CloudinaryUploadWidgetResults) => {
    try {
      setIsUploading(true);
      
      if (results.info && typeof results.info !== "string") {
        const photoData: PhotoData = {
          url: results.info.secure_url,
          publicId: results.info.public_id
        };
        
        onUpload?.(photoData);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onRemove?.();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
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
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1.5 hover:bg-accent/80 transition-colors shadow-md"
            title="Remove photo"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      )}
      
      {/* Upload Button */}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        onSuccess={handleUpload}
        options={{
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["png", "jpeg", "jpg"],
          maxFileSize: 1500000, // 1.5MB
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <FaCamera className="w-4 h-4" />
            {isUploading 
              ? "Uploading..." 
              : currentPhoto 
                ? "Change Photo" 
                : "Upload Photo"
            }
          </button>
        )}
      </CldUploadWidget>
      
      {/* Upload Instructions */}
      {!currentPhoto && (
        <div className="text-center">
          <p className="text-sm text-foreground/70">
            Click to upload a photo of your dog
          </p>
          <p className="text-xs text-foreground/50 mt-1">
            JPG, PNG • Max 1.5MB
          </p>
        </div>
      )}
    </div>
  );
};
