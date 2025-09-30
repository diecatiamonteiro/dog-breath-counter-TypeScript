/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  },
};

export default nextConfig;
