/**
 * @file errorHandler.ts
 * @description Handles shared error handling logic for both email and Google auth
 *              It takes server error responses and converts them into user-friendly error messages
 */

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const handleAuthError = (error: unknown): string => {
  let errorMsg = "An error occurred. Please try again.";

  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError;
    const serverMessage = axiosError.response?.data?.message;

    if (serverMessage) {
      // Match exact server error messages from auth controller
      if (serverMessage === "User not found") {
        errorMsg = "User not found. Please register first.";
      } else if (serverMessage === "Invalid email or password") {
        errorMsg = "Invalid email or password";
      } else if (serverMessage === "User with this email already exists") {
        errorMsg = "User already exists. Please sign in.";
      } else if (serverMessage === "Google token is required") {
        errorMsg = "Google authentication failed. Please try again.";
      } else if (serverMessage === "Invalid Google token") {
        errorMsg = "Google authentication failed. Please try again.";
      } else if (serverMessage.includes("Wrong number of segments")) {
        errorMsg = "Google authentication failed. Please try again.";
      } else {
        // For any other server message, use it directly
        errorMsg = serverMessage;
      }
    }
  }

  return errorMsg;
};
