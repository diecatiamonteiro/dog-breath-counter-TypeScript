import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";

/**
 * @desc   Create a breathing log for a specific dog
 * @route  POST /api/dogs/:dogId/breathing-logs
 * @access Protected
 */
export const createBreathingLog: Controller<AuthenticatedRequest> = async (
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
 * @desc   Get all breathing logs for a specific dog
 * @route  GET /api/dogs/:dogId/breathing-logs
 * @access Protected
 */
export const getAllBreathingLogs: Controller<AuthenticatedRequest> = async (
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
 * @desc   Get one breathing log by its ID
 * @route  GET /api/dogs/:dogId/breathing-logs/:logId
 * @access Protected
 */
export const getBreathingLogById: Controller<AuthenticatedRequest> = async (
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
 * @desc   Delete a breathing log by its ID
 * @route  DELETE /api/dogs/:dogId/breathing-logs/:logId
 * @access Protected
 */
export const deleteBreathingLogById: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
  } catch (error) {
    next(error);
  }
};
