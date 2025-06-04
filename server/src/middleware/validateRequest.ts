/**
 * @file validateRequest.ts
 * @description Middleware to validate user requests (register & login)
 */

import { Controller } from "../types/controller";
import {
  LoginRequestBody,
  RegisterRequestBody,
} from "../types/userRequests";
import { validateEmail, validatePassword } from "../utils/validation";
import createError from "http-errors";

export const validateRegisterRequest: Controller<{
  body: RegisterRequestBody;
}> = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
        throw createError(400, "All fields are required");
      }

    req.body.email = validateEmail(email);

    validatePassword(password);

    next();
  } catch (error) {
    next(error);
  }
};

export const validateLoginRequest: Controller<{
  body: LoginRequestBody;
}> = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, "Email and password are required");
    }

    req.body.email = validateEmail(email);

    if (!password?.trim()) {
      throw createError(400, "Password is required");
    }
    next();
  } catch (error) {
    next(error);
  }
};
