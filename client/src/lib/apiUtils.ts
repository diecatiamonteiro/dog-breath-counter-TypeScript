/**
 * @file apiUtils.ts
 * @description Utility functions for API calls
 *              It safely extracts the error message from an Axios error object.
 *              Used in the api calls src/api/
 */

import { AxiosError } from "axios";
import { APIError } from "@/types/APIError";

/**
 * Extract error message from axios error response
 * @param error - Axios error object
 * @returns Formatted error message string
 */
export const getErrorMessage = (error: AxiosError<APIError>): string => {
  // 1st- Check for server response error message first
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  // 2nd- Check for direct message property
  if (
    error.response?.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    return (error.response.data as any).message;
  }
  // 3rd- Fall back to axios error message
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

/**
 * Type guard to check if an unknown error is an AxiosError
 * @param error - Any error object
 * @returns True if error is an AxiosError
 */
export const isAxiosError = (error: unknown): error is AxiosError<APIError> => {
  return error instanceof AxiosError;
};
