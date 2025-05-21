import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 * @access Public
 */
export const register: Controller = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Log in and return JWT token
 * @route  POST /api/auth/login
 * @access Public
 */
export const login: Controller = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Log in or register with Google OAuth
 * @route  POST /api/auth/login/google
 * @access Public
 */
export const loginGoogle: Controller = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Log out user (server must clear the cookie)
 * @route  GET /api/auth/logout
 * @access Protected
 */
export const logout: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Send reset link to user's email (token is generated here)
 * @route  POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword: Controller = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Reset password using token (token proves user identity)
 * @route  POST /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword: Controller = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
