/**
 * @file server/src/controllers/breathingLogController.ts
 * @description Controller for breathing log routes:
 *                - createBreathingLog
 *                - getAllBreathingLogs
 *                - getBreathingLogById
 *                - deleteBreathingLogById
 *                - generateBreathingLogPdf
 *                - sendBreathingLogEmail
 */

import mongoose from "mongoose";
import BreathingLog from "../models/BreathingLog";
import Dog from "../models/Dog";
import User from "../models/User";
import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";
import {
  CreateBreathingLogRequestBody,
  GenerateReportRequestBody,
  SendEmailReportRequestBody,
} from "../types/userRequests";
import createError from "http-errors";
import { withTransaction } from "../utils/transaction";
import { generatePDF, ReportData } from "../services/pdfService";
import { sendEmail, generateEmailHTML } from "../services/emailService";

/**
 * @desc   Create a breathing log for a specific dog
 * @route  POST /api/dogs/:id/breathing-logs
 * @access Protected
 */
export const createBreathingLog: Controller<
  AuthenticatedRequest & { body: CreateBreathingLogRequestBody }
> = async (req, res, next) => {
  try {
    // First check if the dog exists and belongs to the user
    const dog = await Dog.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!dog) {
      throw createError(404, "Dog not found");
    }

    // Calculate BPM
    const calculatedBPM = req.body.breathCount * (60 / req.body.duration);

    const breathingLogData = {
      ...req.body,
      dogId: dog._id,
      userId: req.user?._id,
      bpm: calculatedBPM,
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
 * @desc   Get all breathing logs for a specific dog
 * @route  GET /api/dogs/:id/breathing-logs
 * @access Protected
 */
export const getAllBreathingLogs: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
    // Get all breathing logs for a specific dog
    const logs = await BreathingLog.find({
      dogId: req.params.id,
      userId: req.user?._id,
    })
      .sort({ createdAt: -1 }); // newest logs first

    res.json({
      message: "Breathing logs retrieved successfully",
      data: {
        breathingLogs: logs,
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
 * @route  GET /api/dogs/:id/breathing-logs/:logId
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
      dogId: req.params.id, // find breathing log by dog id
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
 * @route  DELETE /api/dogs/:id/breathing-logs/:logId
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
        dogId: req.params.id,
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

/**
 * @desc   Generate and downloads PDF reports of breathing logs for a dog
 * @route  POST /api/dogs/:id/breathing-logs/generate-pdf
 * @access Protected
 */
export const generateBreathingLogPdf: Controller<
  AuthenticatedRequest & { body: GenerateReportRequestBody }
> = async (req, res, next) => {
  try {
    // Check if dog exists and belongs to user
    const dog = await Dog.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!dog) {
      throw createError(404, "Dog not found");
    }

    // Get user info
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw createError(404, "User not found");
    }

    // Parse date range
    const startDate = req.body.startDate
      ? new Date(req.body.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    
    let endDate: Date;
    if (req.body.endDate) {
      endDate = new Date(req.body.endDate);
      // Set to end of day to include all logs from the selected date
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
    }

    // Get breathing logs for the date range
    const logs = await BreathingLog.find({
      dogId: req.params.id,
      userId: req.user?._id,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    if (logs.length === 0) {
      throw createError(
        404,
        "No breathing logs found for the specified date range"
      );
    }

    // Filter out logs with BPM 0
    const validLogs = logs.filter((log) => log.bpm > 0);

    if (validLogs.length === 0) {
      throw createError(
        404,
        "No valid breathing logs found for the specified date range (all logs have BPM 0)"
      );
    }

    // Calculate summary statistics
    const bpmValues = validLogs.map((log) => log.bpm);
    const averageBPM =
      bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length;
    const lowestBPM = Math.min(...bpmValues);
    const highestBPM = Math.max(...bpmValues);

    // Format logs for report
    const formattedLogs = validLogs.map((log) => ({
      date: log.createdAt.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: log.createdAt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      bpm: log.bpm,
      breathCount: log.breathCount,
      duration: log.duration,
      comment: log.comment,
    }));

    // Prepare report data
    const reportData: ReportData = {
      dog: {
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        maxBreathingRate: dog.maxBreathingRate,
      },
      logs: formattedLogs,
      summary: {
        totalLogs: validLogs.length,
        averageBPM,
        lowestBPM,
        highestBPM,
        dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      },
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };

    // Generate PDF
    const pdfBuffer = await generatePDF(reportData);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="breathing-report-${dog.name}-${
        new Date().toISOString().split("T")[0]
      }.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    if (error instanceof createError.HttpError) {
      return next(error);
    }
    if (error instanceof Error) {
      return next(createError(500, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Send a PDF report of breathing logs via email
 * @route  POST /api/dogs/:id/breathing-logs/send-email
 * @access Protected
 */
export const sendBreathingLogEmail: Controller<
  AuthenticatedRequest & { body: SendEmailReportRequestBody }
> = async (req, res, next) => {
  try {
    // Check if dog exists and belongs to user
    const dog = await Dog.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!dog) {
      throw createError(404, "Dog not found");
    }

    // Get user info
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw createError(404, "User not found");
    }

    // Validate recipient email
    const { recipientEmail } = req.body;
    if (!recipientEmail || !recipientEmail.includes("@")) {
      throw createError(400, "Valid recipient email is required");
    }

    // Parse date range
    const startDate = req.body.startDate
      ? new Date(req.body.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    
    let endDate: Date;
    if (req.body.endDate) {
      endDate = new Date(req.body.endDate);
      // Set to end of day to include all logs from the selected date
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
    }

    // Get breathing logs for the date range
    const logs = await BreathingLog.find({
      dogId: req.params.id,
      userId: req.user?._id,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    if (logs.length === 0) {
      throw createError(
        404,
        "No breathing logs found for the specified date range"
      );
    }

    // Filter out logs with BPM 0
    const validLogs = logs.filter((log) => log.bpm > 0);

    if (validLogs.length === 0) {
      throw createError(
        404,
        "No valid breathing logs found for the specified date range (all logs have BPM 0)"
      );
    }

    // Calculate summary statistics
    const bpmValues = validLogs.map((log) => log.bpm);
    const averageBPM =
      bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length;
    const lowestBPM = Math.min(...bpmValues);
    const highestBPM = Math.max(...bpmValues);

    // Format logs for report
    const formattedLogs = validLogs.map((log) => ({
      date: log.createdAt.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: log.createdAt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      bpm: log.bpm,
      breathCount: log.breathCount,
      duration: log.duration,
      comment: log.comment,
    }));

    // Prepare report data
    const reportData: ReportData = {
      dog: {
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        maxBreathingRate: dog.maxBreathingRate,
      },
      logs: formattedLogs,
      summary: {
        totalLogs: validLogs.length,
        averageBPM,
        lowestBPM,
        highestBPM,
        dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      },
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };

    // Generate PDF
    const pdfBuffer = await generatePDF(reportData);

    // Generate email HTML
    const emailHTML = generateEmailHTML(reportData, recipientEmail);

    // Send email with PDF attachment
    await sendEmail({
      to: recipientEmail,
      subject: `Breathing Report for ${
        dog.name
      } - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      html: emailHTML,
      attachments: [
        {
          filename: `breathing-report-${dog.name}-${
            new Date().toISOString().split("T")[0]
          }.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({
      message: "Email report sent successfully",
      data: {
        recipientEmail,
        dogName: dog.name,
        dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        totalLogs: validLogs.length,
      },
    });
  } catch (error) {
    console.error("Email sending error details:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      recipientEmail: req.body.recipientEmail,
      dogId: req.params.id,
      userId: req.user?._id,
    });

    if (error instanceof createError.HttpError) {
      return next(error);
    }
    if (error instanceof Error) {
      return next(createError(500, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};
