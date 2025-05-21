import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";

/**
 * @desc   Get all dogs from the logged-in user
 * @route  GET /api/dogs
 * @access Protected
 */
export const getAllDogs: Controller<AuthenticatedRequest> = async (
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
 * @desc   Add a new dog
 * @route  POST /api/dogs
 * @access Protected
 */
export const createDog: Controller<AuthenticatedRequest> = async (
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
 * @desc   Get a specific dog profile by ID
 * @route  GET /api/dogs/:id
 * @access Protected
 */
export const getDogById: Controller<AuthenticatedRequest> = async (
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
 * @desc   Update a specific dog profile by ID
 * @route  PATCH /api/dogs/:id
 * @access Protected
 */
export const updateDog: Controller<AuthenticatedRequest> = async (
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
 * @desc   Delete a specific dog profile by ID
 * @route  DELETE /api/dogs/:id
 * @access Protected
 */
export const deleteDog: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
  } catch (error) {
    next(error);
  }
};
