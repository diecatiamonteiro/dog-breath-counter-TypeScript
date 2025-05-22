/**
 * @file validation.ts
 * @description Utility functions for validating user input
 */

import validator from "validator";
import createError from "http-errors";

export const validateEmail = (email: string): string => {
  const sanitizedEmail = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: true,
    all_lowercase: true,
  });
  if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
    throw createError(400, "Invalid email address");
  }
  return sanitizedEmail;
};

export const validatePassword = (password: string): void => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw createError(
      400,
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }
};
