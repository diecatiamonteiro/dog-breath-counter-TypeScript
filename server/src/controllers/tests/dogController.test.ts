/**
 * @file dogController.test.ts
 * @description Test suite for dogController: getAllDogs, createDog, getDogById, updateDog, deleteDog
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Response } from "express";
import mongoose from "mongoose";
import Dog from "../../models/Dog";
import BreathingLog from "../../models/BreathingLog";
import { AuthenticatedRequest } from "../../types/express";
import User from "../../models/User";
import {
  createDog,
  deleteDog,
  getAllDogs,
  getDogById,
  updateDog,
} from "../dogController";
import {
  CreateDogRequestBody,
  UpdateDogRequestBody,
} from "../../types/requests/userRequests";
import createError from "http-errors";

describe("Dog Controller", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: Mock;
  let testUser: any;

  beforeEach(async () => {
    // Clear collections
    await Dog.deleteMany({});
    await BreathingLog.deleteMany({});

    // Create test user
    testUser = await User.create({
      email: "test@example.com",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
    });

    // Setup mock request, response and next
    mockReq = {
      user: testUser,
    };
    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe("getAllDogs", () => {
    it("should get all dogs for the logged-in user", async () => {
      // Create test dogs
      const dog1 = await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      });

      const dog2 = await Dog.create({
        userId: testUser._id,
        name: "Buddy",
        maxBreathingRate: 25,
      });

      await getAllDogs(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      // Verify the response
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Dogs retrieved successfully",
        data: {
          dogs: expect.arrayContaining([
            expect.objectContaining({
              _id: dog1._id,
              name: "Max",
              maxBreathingRate: 30,
              userId: testUser._id,
            }),
            expect.objectContaining({
              _id: dog2._id,
              name: "Buddy",
              maxBreathingRate: 25,
              userId: testUser._id,
            }),
          ]),
        },
      });
    });

    it("should return empty array when user has no dogs", async () => {
      await getAllDogs(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Dogs retrieved successfully",
        data: {
          dogs: [],
        },
      });
    });
  });

  describe("createDog", () => {
    it("should create a new dog", async () => {
      mockReq = {
        user: testUser,
        body: {
          name: "Rex",
          maxBreathingRate: 35,
        },
      };

      await createDog(
        mockReq as AuthenticatedRequest & { body: CreateDogRequestBody },
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Dog created successfully",
        data: expect.objectContaining({
          dog: expect.objectContaining({
            name: "Rex",
            maxBreathingRate: 35,
            userId: testUser._id,
          }),
        }),
      });
    });
  });

  describe("getDogById", () => {
    it("should get a dog by ID", async () => {
      const dog = (await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      mockReq = {
        user: testUser,
        params: { id: dog._id.toString() },
      };

      await getDogById(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Dog retrieved successfully by ID",
        data: {
          dog: expect.objectContaining({
            name: "Max",
            maxBreathingRate: 30,
          }),
        },
      });
    });

    it("should return 404 if dog not found", async () => {
      mockReq = {
        user: testUser,
        params: { id: new mongoose.Types.ObjectId().toString() },
      };

      await getDogById(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          message: "Dog not found",
        })
      );
    });
  });

  describe("updateDog", () => {
    it("should update a dog", async () => {
      const dog = (await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      mockReq = {
        user: testUser,
        params: { id: dog._id.toString() },
        body: {
          name: "Updated Max",
          maxBreathingRate: 35,
        },
      };

      await updateDog(
        mockReq as AuthenticatedRequest & { body: UpdateDogRequestBody },
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Dog updated successfully",
        data: {
          dog: expect.objectContaining({
            name: "Updated Max",
            maxBreathingRate: 35,
          }),
        },
      });
    });

    it("should return 404 if dog to update not found", async () => {
      mockReq = {
        user: testUser,
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: {
          name: "Updated Max",
        },
      };

      await updateDog(
        mockReq as AuthenticatedRequest & { body: UpdateDogRequestBody },
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          message: "Dog not found",
        })
      );
    });
  });

  describe("deleteDog", () => {
    it("should delete a dog and its breathing logs", async () => {
      const dog = (await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      })) as mongoose.Document & { _id: mongoose.Types.ObjectId };

      await BreathingLog.create({
        dogId: dog._id,
        userId: testUser._id,
        breathCount: 12,
        duration: 30,
        bpm: 24,
      });

      mockReq = {
        user: testUser,
        params: { id: dog._id.toString() },
      };

      await deleteDog(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Dog and associated breathing logs deleted successfully",
        data: { deletedDogId: dog._id.toString() },
      });

      // Verify dog and breathing logs are deleted
      const deletedDog = await Dog.findById(dog._id);
      const deletedLogs = await BreathingLog.find({ dogId: dog._id });
      expect(deletedDog).toBeNull();
      expect(deletedLogs).toHaveLength(0);
    });

    it("should return 404 if dog to delete not found", async () => {
      mockReq = {
        user: testUser,
        params: { id: new mongoose.Types.ObjectId().toString() },
      };

      await deleteDog(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          message: "Dog not found",
        })
      );
    });
  });
});
