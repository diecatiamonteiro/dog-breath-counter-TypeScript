/**
 * @file axios.ts
 * @description Global configuration that will be used for all axios requests to the server
 *              setAxiosDefaults() is called in the client-side component in components/AxiosProvider.tsx
 */

import axios from "axios";

export const setAxiosDefaults = () => {
  // Environment-specific base URL configuration
  if (process.env.NODE_ENV === "development") {
    // Local development: point to Express server
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  } else {
    // Production: use relative paths (Vercel proxy handles routing)
    axios.defaults.baseURL = "";
  }
  
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["Content-Type"] = "application/json";
};
