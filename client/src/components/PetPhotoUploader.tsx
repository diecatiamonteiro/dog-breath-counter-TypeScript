/**
 * @file PetPhotoUploader.tsx
 * @description Cloudinary upload widget component for user to upload pet photos
 */

"use client"; // this component runs on the browser, not on the server

import { CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useState } from "react";
import Image from "next/image";

interface PhotoData {
  url: string;
  publicId: string;
}

interface PetPhotoUploaderProps {
  currentPhoto?: PhotoData;
  onUpload?: (photo: PhotoData) => void;
  onError?: (error: string) => void;
}

export const PetPhotoUploader: React.FC<PetPhotoUploaderProps> = ({
  currentPhoto,
  onUpload,
  onError
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

  return (
    <div className="flex flex-col items-center gap-4">
      {currentPhoto && (
        <div className="relative w-32 h-32">
          <Image
            src={currentPhoto.url}
            alt="Pet photo"
            fill
            className="object-cover rounded-full"
          />
        </div>
      )}
      
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
            onClick={() => open()}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isUploading ? "Uploading..." : currentPhoto ? "Change Photo" : "Upload Photo"}
          </button>
        )}
      </CldUploadWidget>
    </div>
  );
};
