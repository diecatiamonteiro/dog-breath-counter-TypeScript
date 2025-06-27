/**
 * @file AuthForm.tsx
 * @description Reusable authentication form component that handles:
 *              - User registration
 *              - User login with email/password
 *              - Google OAuth login
 *              - Form validation and error handling
 */

"use client";

import { useAppContext } from "@/context/Context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useId } from "react";
import { FcGoogle } from "react-icons/fc";
import { PasswordRequirements } from "./PasswordRequirements";
import LoadingSpinner from "@/app/loading";
import { useGoogleLogin } from "@react-oauth/google";
import { validateForm, loginWithEmail, loginWithGoogle } from "./util";

// Type alias to restrict values to 2 possible strings and control mode on the form
type AuthMode = "login" | "register";

// Defines the shape of the props that can be passed into the AuthForm component
interface AuthFormProps {
  defaultMode?: AuthMode;
  onSuccess?: () => void;
}

export default function AuthForm({
  // Destructured function parameter with default values
  defaultMode = "login",
  onSuccess, // undefined if not passed
}: AuthFormProps) {
  const router = useRouter();
  const { userState, userDispatch } = useAppContext();
  const uniqueId = useId(); // Generate unique ID for this form instance

  // Form state

  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({}); // errors for form fields key, value (eg, email: "Invalid email")
  const [errorMessage, setErrorMessage] = useState(""); // errors from the server (eg, "Invalid email")
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors & form data when mode (login/register) changes
  useEffect(() => {
    setErrors({}); // clear errors from form fields
    setErrorMessage(""); // clear error message from the server
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }, [mode]);

  // Handle form input changes (it tells TS that event is coming from an <input> element)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Destructures input name ("email") and value ("whatever the user types")
    const { name, value } = e.target;

    // Update formData state with only changed fields; others (...prev) stay untouched
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear general error message when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // Handle form submission (imports loginWithEmail & validateForm from util)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = validateForm(formData, mode);
    setErrors(validation.errors);

    if (!validation.isValid) return;

    setIsSubmitting(true);

    try {
      const result = await loginWithEmail({
        mode,
        formData,
        userDispatch,
        onSuccess,
        router,
      });

      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google login (imports loginWithGoogle from util)
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);

      try {
        const result = await loginWithGoogle({
          tokenResponse,
          userDispatch,
          onSuccess,
          router,
        });

        if (!result.success && result.error) {
          setErrorMessage(result.error);
        }
      } catch {
        setErrorMessage("Google authentication failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setErrorMessage("Google authentication failed. Please try again.");
      setIsSubmitting(false);
    },
  });

  // Toggle between login and register modes
  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-navbar-bg/70 rounded-lg shadow-lg border border-primary/20 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-foreground/70">
            {mode === "login"
              ? "Sign in to your account to continue"
              : "Join us to start monitoring your dog's breathing"}
          </p>
        </div>

        {isSubmitting || userState.isLoading ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner />
          </span>
        ) : (
          <></>
        )}

        {/* Google login button */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={isSubmitting || userState.isLoading}
          className="w-full flex items-center justify-center gap-3 bg-navbar-items-bg border border-primary/30 rounded-lg px-4 py-3 font-medium hover:bg-primary/50 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed mb-6 transition-colors transition-duration-300"
        >
          <FcGoogle className="w-5 h-5" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-navbar-bg/70 text-foreground/60">
              Or continue with
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name fields only for register */}
          {mode === "register" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor={`firstName-${uniqueId}`}
                  className="block text-sm font-medium mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id={`firstName-${uniqueId}`}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                    errors.firstName
                      ? "border-accent"
                      : "border-primary/30 focus:border-primary"
                  }`}
                  placeholder="Jane"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-accent">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`lastName-${uniqueId}`}
                  className="block text-sm font-medium mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id={`lastName-${uniqueId}`}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                    errors.lastName
                      ? "border-accent"
                      : "border-primary/30 focus:border-primary"
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-accent">{errors.lastName}</p>
                )}
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label
              htmlFor={`email-${mode}-${uniqueId}`}
              className="block text-sm font-medium mb-1 mt-4"
            >
              Email
            </label>
            <input
              type="email"
              id={`email-${mode}-${uniqueId}`}
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                errors.email
                  ? "border-accent"
                  : "border-primary/30 focus:border-primary"
              }`}
              placeholder="jane@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-accent">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor={`password-${mode}-${uniqueId}`}
              className="block text-sm font-medium mb-1 mt-4"
            >
              Password
            </label>
            <input
              type="password"
              id={`password-${mode}-${uniqueId}`}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                errors.password
                  ? "border-accent"
                  : "border-primary/30 focus:border-primary"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-accent">{errors.password}</p>
            )}

            {/* Password requirements only for register */}
            {mode === "register" && (
              <PasswordRequirements password={formData.password} />
            )}
          </div>

          {/* Confirm password field only for register */}
          {mode === "register" && (
            <div>
              <label
                htmlFor={`confirmPassword-${mode}-${uniqueId}`}
                className="block text-sm font-medium mb-1 mt-4"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id={`confirmPassword-${mode}-${uniqueId}`}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                  errors.confirmPassword
                    ? "border-accent"
                    : "border-primary/30 focus:border-primary"
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-accent">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <p className="mt-8 text-base text-accent text-center">
              {errorMessage}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || userState.isLoading}
            className="w-full bg-primary text-white py-3 px-4 mt-8 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || userState.isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" color="white" />
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Mode toggle */}
        <div className="mt-6 text-center">
          <p className="text-foreground/70">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-1 text-primary hover:text-primary-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
