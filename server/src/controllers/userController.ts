import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";

/**
 * @desc   Get current user profile
 * @route  GET /api/user/me
 * @access Protected
 */
export const getUser: Controller<AuthenticatedRequest> = async (
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
 * @desc   Delete current user profile
 * @route  DELETE /api/user/me
 * @access Protected
 */
export const deleteUser: Controller<AuthenticatedRequest> = async (
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
 * @desc   Update current user profile
 * @route  PATCH /api/user/me
 * @access Protected
 */
export const updateUser: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
  } catch (error) {
    next(error);
  }
};
