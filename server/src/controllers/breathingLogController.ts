import mongoose from "mongoose";
import BreathingLog from "../models/BreathingLog";
import Dog from "../models/Dog";
import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";
import { CreateBreathingLogRequestBody } from "../types/userRequests";
import createError from "http-errors";
import { withTransaction } from "../utils/transaction";

/**
 * @desc   Create a breathing log for a specific dog
 * @route  POST /api/dogs/:dogId/breathing-logs
 * @access Protected
 */
export const createBreathingLog: Controller<
  AuthenticatedRequest & { body: CreateBreathingLogRequestBody }
> = async (req, res, next) => {
  try {
    // First check if the dog exists and belongs to the user
    const dog = await Dog.findOne({
      _id: req.params.dogId,
      userId: req.user?._id,
    });

    if (!dog) {
      throw createError(404, "Dog not found");
    }

    // Validate that the breathing rate doesn't exceed the dog's max rate
    const calculatedBPM = req.body.breathCount * (60 / req.body.duration);
    if (calculatedBPM > dog.maxBreathingRate) {
      throw createError(400, `Breathing rate ${calculatedBPM} exceeds dog's maximum rate of ${dog.maxBreathingRate}`);
    }

    const breathingLogData = {
      ...req.body,
      dogId: dog._id,
      userId: req.user?._id,
      bpm: calculatedBPM
    };

    const newBreathingLog = await BreathingLog.create(breathingLogData);

    res.status(201).json({
      message: "Breathing log created successfully",
      data: { breathingLog: newBreathingLog },
    });
  } catch (error) {
    if (error instanceof createError.HttpError) {
      return next(error);
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return next(createError(400, error.message));
    }
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Get all breathing logs for a specific dog with pagination
 * @route  GET /api/dogs/:dogId/breathing-logs
 * @access Protected
 */
export const getAllBreathingLogs: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
    // Query params
    const page = parseInt(req.query.page as string) || 1; // which page the user wants to see; default to page 1 if no page is provided
    const limit = parseInt(req.query.limit as string) || 10; // how many logs per page; default to 10 if no limit is provided
    const skip = (page - 1) * limit; // how many logs to skip; eg if page 1, skip 0 logs; if page 2, skip 10 logs; if page 3, skip 20 logs; etc

    // Get all breathing logs for a specific dog
    const logs = await BreathingLog.find({
      dogId: req.params.dogId,
      userId: req.user?._id,
    })
      .sort({ createdAt: -1 }) // newest logs first
      .skip(skip) // skip the logs that are not in the current page
      .limit(limit); // limit the number of logs per page

    // Get the total number of logs for the specific dog
    const total = await BreathingLog.countDocuments({
      dogId: req.params.dogId,
      userId: req.user?._id,
    });

    res.json({
      message: "Breathing logs retrieved successfully",
      data: {
        breathingLogs: logs,
        pagination: {
          page, // current page number
          limit, // logs per page
          total, // total number of logs
          totalPages: Math.ceil(total / limit), // total number of pages
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
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
    const breathingLog = await BreathingLog.findOne({
      _id: req.params.logId, // find breathing log by route params (dogs/:dogId/breathing-logs/:logId)
      dogId: req.params.dogId, // find breathing log by dog id
      userId: req.user?._id, // find breathing log by user id
    });

    if (!breathingLog) {
      throw createError(404, "Breathing log not found");
    }

    res.json({
      message: "Breathing log retrieved successfully by ID",
      data: { breathingLog },
    });
  } catch (error) {
    // Pass through the error if it's already an HttpError (like previous 404)
    if (error instanceof createError.HttpError) {
      return next(error);
    }
    // Handle other errors
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
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
    const result = await withTransaction(async (session) => {
      // Find the breathing log to delete
      const breathingLogToDelete = await BreathingLog.findOne({
        _id: req.params.logId,
        dogId: req.params.dogId,
        userId: req.user?._id,
      }).session(session);

      if (!breathingLogToDelete) {
        throw createError(404, "Breathing log not found");
      }

      // Delete the breathing log
      await breathingLogToDelete.deleteOne({ session });

      // Return the breathing log ID so FE knows which breathing log to remove from state
      return req.params.logId;
    });

    res.json({
      message: "Breathing log deleted successfully",
      data: { deletedBreathingLogId: req.params.logId }, // So FE knows which breathing log to remove from state
    });
  } catch (error) {
    if (error instanceof createError.HttpError) {
      return next(error);
    }

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid breathing log ID format"));
    }

    if (error instanceof Error) {
      return next(createError(400, error.message));
    }

    return next(createError(500, "An unexpected error occurred"));
  }
};
