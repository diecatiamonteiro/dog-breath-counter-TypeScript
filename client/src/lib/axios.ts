/**
 * @file axios.ts
 * @description Global configuration that will be used for all axios requests to the server
 *              setAxiosDefaults() is called in the client-side component in components/AxiosProvider.tsx
 */

import axios from "axios";

export const setAxiosDefaults = () => {
  axios.defaults.baseURL = ""; // use relative paths because Vercel automatically reads the vercel.json file and uses the rewrites to proxy requests to the server
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["Content-Type"] = "application/json";
};
