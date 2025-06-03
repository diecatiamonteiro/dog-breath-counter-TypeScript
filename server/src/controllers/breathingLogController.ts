import mongoose from "mongoose";
import BreathingLog from "../models/BreathingLog";
import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";
import { CreateBreathingLogRequestBody } from "../types/requests/userRequests";
import createError from "http-errors";

/**
 * @desc   Create a breathing log for a specific dog
 * @route  POST /api/dogs/:dogId/breathing-logs
 * @access Protected
 */
export const createBreathingLog: Controller<
  AuthenticatedRequest & { body: CreateBreathingLogRequestBody }
> = async (req, res, next) => {
  try {
    const breathingLogData = {
      ...req.body,
      dogId: req.params.dogId,
      userId: req.user?._id,
    };
    const newBreathingLog = await BreathingLog.create(breathingLogData);

    res.status(201).json({
      message: "Breathing log created successfully",
      data: { breathingLog: newBreathingLog },
    });
  } catch (error) {
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
  const isTestEnv = process.env.NODE_ENV === "test";
  let session: mongoose.ClientSession | null = null; // prepare a session for the transaction

  try {
    if (!isTestEnv) {
      // If not in test environment, start a session for transaction to ensure all deletions happen together or not at all (if any delete operation fails, nothing is deleted); if in test environment, don't start a session and don't use transactions because test database doenst support transactions
      session = await mongoose.startSession();
      session.startTransaction();
    }

    // Find the breathing log to delete
    const breathingLogToDelete = await (session
      ? BreathingLog.findOne({
          _id: req.params.logId,
          dogId: req.params.dogId,
          userId: req.user?._id,
        }).session(session)
      : BreathingLog.findOne({
          _id: req.params.logId,
          dogId: req.params.dogId,
          userId: req.user?._id,
        }));

    if (!breathingLogToDelete) {
      throw createError(404, "Breathing log not found");
    }

    // Delete the breathing log
    await (session
      ? breathingLogToDelete.deleteOne({ session })
      : breathingLogToDelete.deleteOne());

    // If everything went well, commit the transaction, ie permanently delete the breathing log
    if (session) {
      await session.commitTransaction();
    }

    res.json({
      message: "Breathing log deleted successfully",
      data: { deletedBreathingLogId: req.params.logId }, // So FE knows which breathing log to remove from state
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }

    if (error instanceof createError.HttpError) {
      return next(error);
    }

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid dog ID format"));
    }

    if (error instanceof Error) {
      return next(createError(400, error.message));
    }

    return next(createError(500, "An unexpected error occurred"));
  }
};
