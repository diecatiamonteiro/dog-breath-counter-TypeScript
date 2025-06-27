/**
 * @file loginWithGoogle.ts
 * @description Handles Google OAuth authentication flow
 *              Imported in AuthForm.tsx in handleGoogleLogin()
 */

import { googleLoginUser } from "@/api/userApi";
import { GoogleLoginUserData } from "@/types/UserTypes";
import { Dispatch } from "react";
import { handleAuthError } from "./errorHandler";

interface LoginWithGoogleParams {
  tokenResponse: { access_token: string };
  userDispatch: Dispatch<any>;
  onSuccess?: () => void;
  router: any;
}

export const loginWithGoogle = async ({
  tokenResponse,
  userDispatch,
  onSuccess,
  router,
}: LoginWithGoogleParams): Promise<{ success: boolean; error?: string }> => {
  try {
    // Google data to send to the server
    const googleData: GoogleLoginUserData = {
      token: tokenResponse.access_token,
    };

    // Send Google data to the server
    await googleLoginUser(userDispatch, googleData);

    // Success - navigate to dashboard
    if (onSuccess) {
      onSuccess();
    }
    router.push("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Google login error:", error);
    const errorMsg = handleAuthError(error);
    return { success: false, error: errorMsg };
  }
};
