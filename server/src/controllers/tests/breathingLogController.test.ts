/**
 * @file breathingLog.test.ts
 * @description Test suite for breathingLogController: createBreathingLog, getAllBreathingLogs, getBreathingLogById, deleteBreathingLogById
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Response } from "express";
import mongoose from "mongoose";
import BreathingLog from "../../models/BreathingLog";
import { AuthenticatedRequest } from "../../types/express";
import User from "../../models/User";
import {
  createBreathingLog,
  getAllBreathingLogs,
  getBreathingLogById,
  deleteBreathingLogById,
} from "../breathingLogController";
import { CreateBreathingLogRequestBody } from "../../types/userRequests";
import createError from "http-errors";
import Dog from "../../models/Dog";

describe("Breathing Log Controller", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: Mock;
  let testUser: any;

  beforeEach(async () => {
    // Clear collections
    await BreathingLog.deleteMany({});

    // Create test user
    testUser = await User.create({
      email: "test@example.com",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
    });

    // Create test dog
    const testDog = (await Dog.create({
      userId: testUser._id,
      name: "Max",
      maxBreathingRate: 30,
    })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

    // Setup mock request, response and next
    mockReq = {
      user: testUser,
      params: { dogId: testDog._id.toString() },
    };
    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe("createBreathingLog", () => {
    it("should create a breathing log", async () => {
      mockReq = {
        ...mockReq,
        user: testUser,
        body: {
          breathCount: 12,
          duration: 30,
          comment: "Test comment",
          bpm: (12 * 60) / 30, // Calculate breaths per minute: (breathCount * 60) / duration
        },
      };

      try {
        await createBreathingLog(
          mockReq as AuthenticatedRequest & {
            body: CreateBreathingLogRequestBody;
          },
          mockRes as Response,
          mockNext
        );
      } catch (error) {
        console.error("Controller error:", error);
      }

      // Check if next was called with an error
      if (mockNext.mock.calls.length > 0) {
        console.log("Next was called with:", mockNext.mock.calls[0][0]);
      }

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Breathing log created successfully",
        data: expect.objectContaining({
          breathingLog: expect.objectContaining({
            breathCount: 12,
            duration: 30,
            comment: "Test comment",
            bpm: 24, // 12 breaths in 30 seconds = 24 breaths per minute
          }),
        }),
      });
    });
  });

  describe("getAllBreathingLogs", () => {
    it("should get all breathing logs for a specific dog with pagination", async () => {
      // Create test dog
      const dog = (await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      // Create test breathing logs
      await Promise.all([
        BreathingLog.create({
          dogId: dog._id,
          userId: testUser._id,
          breathCount: 12,
          duration: 30,
          bpm: 24,
          comment: "First log",
        }),
        BreathingLog.create({
          dogId: dog._id,
          userId: testUser._id,
          breathCount: 15,
          duration: 30,
          bpm: 30,
          comment: "Second log",
        }),
        BreathingLog.create({
          dogId: dog._id,
          userId: testUser._id,
          breathCount: 20,
          duration: 60,
          bpm: 20,
          comment: "Third log",
        }),
      ]);

      mockReq = {
        user: testUser,
        params: { dogId: dog._id.toString() },
        query: { page: "1", limit: "2" },
      };

      await getAllBreathingLogs(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Breathing logs retrieved successfully",
        data: {
          breathingLogs: expect.arrayContaining([
            expect.objectContaining({
              breathCount: expect.any(Number),
              duration: expect.any(Number),
              bpm: expect.any(Number),
            }),
          ]),
          pagination: {
            page: 1,
            limit: 2,
            total: 3,
            totalPages: 2,
          },
        },
      });
    });
  });

  describe("getBreathingLogById", () => {
    it("should get a breathing log by ID", async () => {
      // Create test dog
      const dog = (await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      // Create test breathing log
      const breathingLog = (await BreathingLog.create({
        dogId: dog._id,
        userId: testUser._id,
        breathCount: 12,
        duration: 30,
        bpm: 24,
        comment: "Test log",
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      mockReq = {
        user: testUser,
        params: {
          dogId: dog._id.toString(),
          logId: breathingLog._id.toString(),
        },
      };

      await getBreathingLogById(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Breathing log retrieved successfully by ID",
        data: {
          breathingLog: expect.objectContaining({
            breathCount: 12,
            duration: 30,
            bpm: 24,
            comment: "Test log",
          }),
        },
      });
    });

    it("should return 404 if breathing log not found", async () => {
      mockReq = {
        user: testUser,
        params: {
          dogId: new mongoose.Types.ObjectId().toString(),
          logId: new mongoose.Types.ObjectId().toString(),
        },
      };

      await getBreathingLogById(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          message: "Breathing log not found",
        })
      );
    });
  });

  describe("deleteBreathingLogById", () => {
    it("should delete a breathing log", async () => {
      // Create test dog
      const dog = (await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      // Create test breathing log
      const breathingLog = (await BreathingLog.create({
        dogId: dog._id,
        userId: testUser._id,
        breathCount: 12,
        duration: 30,
        bpm: 24,
        comment: "Test log",
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      mockReq = {
        user: testUser,
        params: {
          dogId: dog._id.toString(),
          logId: breathingLog._id.toString(),
        },
      };

      await deleteBreathingLogById(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Breathing log deleted successfully",
        data: { deletedBreathingLogId: breathingLog._id.toString() },
      });

      // Verify breathing log was deleted
      const deletedLog = await BreathingLog.findById(breathingLog._id);
      expect(deletedLog).toBeNull();
    });

    it("should return 404 if breathing log to delete not found", async () => {
      mockReq = {
        user: testUser,
        params: {
          dogId: new mongoose.Types.ObjectId().toString(),
          logId: new mongoose.Types.ObjectId().toString(),
        },
      };

      await deleteBreathingLogById(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          message: "Breathing log not found",
        })
      );
    });
  });
});
