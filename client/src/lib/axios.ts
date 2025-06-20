/**
 * @file axios.ts
 * @description Global configuration that will be used for all axios requests to the server
 *              setAxiosDefaults() is called in the client-side component in components/AxiosProvider.tsx
 */

import axios from "axios";

export const setAxiosDefaults = () => {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL; // in development uses url from .env.local; in production from .env
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["Content-Type"] = "application/json";
};
