/**
 * @file loginWithEmail.ts
 * @description Handles both login and register flows with email/password
 *              Imported in AuthForm.tsx in handleSubmit()
 */

import { loginUser, registerUser } from "@/api/userApi";
import { LoginUserData, RegisterUserData } from "@/types/UserTypes";
import { Dispatch } from "react";
import { handleAuthError } from "./errorHandler";

type AuthMode = "login" | "register";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginWithEmailParams {
  mode: AuthMode;
  formData: FormData;
  userDispatch: Dispatch<any>;
  onSuccess?: () => void;
  router: any;
}

export const loginWithEmail = async ({
  mode,
  formData,
  userDispatch,
  onSuccess,
  router,
}: LoginWithEmailParams): Promise<{ success: boolean; error?: string }> => {
  try {
    if (mode === "register") {
      const registerData: RegisterUserData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password.trim(),
      };

      await registerUser(userDispatch, registerData);
    } else {
      const loginData: LoginUserData = {
        email: formData.email.toLowerCase(),
        password: formData.password,
      };

      await loginUser(userDispatch, loginData);
    }

    if (onSuccess) {
      onSuccess();
    }
    router.push("/dashboard");

    return { success: true };
  } catch (error) {
    const errorMsg = handleAuthError(error);
    return { success: false, error: errorMsg };
  }
};
