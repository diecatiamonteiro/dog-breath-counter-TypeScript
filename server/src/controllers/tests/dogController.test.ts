/**
 * @file dogController.test.ts
 * @description Test suite for dogController: getAllDogs, createDog, getDogById, updateDog, deleteDog
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Response } from "express";
import mongoose, { Document } from "mongoose";
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
} from "../../types/userRequests";
import createError from "http-errors";
import cloudinary from "../../config/cloudinary";
import { IDog } from "../../models/Dog";

// Mock cloudinary
vi.mock("../../config/cloudinary", () => ({
  default: {
    uploader: {
      destroy: vi.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

describe("Dog Controller", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: Mock;
  let testUser: any;

  // Mock photo data
  const mockPhotoData = {
    url: "https://res.cloudinary.com/demo/image/upload/dog.jpg",
    publicId: "pets/dog123"
  };

  beforeEach(async () => {
    // Clear collections
    await Dog.deleteMany({});
    await BreathingLog.deleteMany({});

    // Reset cloudinary mock
    vi.mocked(cloudinary.uploader.destroy).mockClear();

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

    it("should create a new dog with photo", async () => {
      mockReq = {
        user: testUser,
        body: {
          name: "Rex",
          maxBreathingRate: 35,
          photo: mockPhotoData
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
            photo: expect.objectContaining({
              url: mockPhotoData.url,
              publicId: mockPhotoData.publicId
            })
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

    it("should update a dog's photo and delete old photo", async () => {
      // Create a dog with initial photo
      const createdDog = await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
        photo: {
          url: "https://old-photo.jpg",
          publicId: "pets/old123"
        }
      });

      const dogId = createdDog._id as mongoose.Types.ObjectId;

      // New photo data
      const newPhotoData = {
        url: "https://new-photo.jpg",
        publicId: "pets/new123"
      };

      mockReq = {
        user: testUser,
        params: { id: dogId.toString() },
        body: {
          photo: newPhotoData
        },
      };

      await updateDog(
        mockReq as AuthenticatedRequest & { body: UpdateDogRequestBody },
        mockRes as Response,
        mockNext
      );

      // Check if old photo was deleted
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("pets/old123");

      // Check if dog was updated with new photo
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Dog updated successfully",
        data: {
          dog: expect.objectContaining({
            photo: expect.objectContaining(newPhotoData)
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
        message: "Dog and all associated data deleted successfully",
        data: { deletedDogId: dog._id.toString() },
      });

      // Verify dog and breathing logs are deleted
      const deletedDog = await Dog.findById(dog._id);
      const deletedLogs = await BreathingLog.find({ dogId: dog._id });
      expect(deletedDog).toBeNull();
      expect(deletedLogs).toHaveLength(0);
    });

    it("should delete a dog with photo and all associated data", async () => {
      const createdDog = await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
        photo: mockPhotoData
      });

      const dogId = createdDog._id as mongoose.Types.ObjectId;

      await BreathingLog.create({
        dogId: dogId,
        userId: testUser._id,
        breathCount: 12,
        duration: 30,
        bpm: 24,
      });

      mockReq = {
        user: testUser,
        params: { id: dogId.toString() },
      };

      await deleteDog(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      // Verify photo deletion was attempted
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(mockPhotoData.publicId);

      // Use toString() for ObjectId comparison
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Dog and all associated data deleted successfully",
        data: { deletedDogId: expect.any(String) },
      });

      // Verify dog and breathing logs are deleted
      const deletedDog = await Dog.findById(dogId);
      const deletedLogs = await BreathingLog.find({ dogId: dogId });
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
