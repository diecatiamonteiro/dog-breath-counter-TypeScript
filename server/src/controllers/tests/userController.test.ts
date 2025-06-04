/**
 * @file userController.test.ts
 * @description Test suite for userController: getUser, deleteUser, updateUser
 */

// TOP OF FILE: mock BEFORE imports that use it
vi.mock("../../utils/transaction", () => ({
  withTransaction: vi.fn().mockImplementation((callback) => callback(null)),
}));

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Response } from "express";
import mongoose from "mongoose";
import User from "../../models/User";
import Dog from "../../models/Dog";
import BreathingLog from "../../models/BreathingLog";
import { getUser, deleteUser, updateUser } from "../userController";
import { AuthenticatedRequest } from "../../types/express";
import { UpdateUserRequestBody } from "../../types/userRequests";
import { withTransaction } from "../../utils/transaction";

describe("User Controller", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: Mock;
  let testUser: any;

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
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

  describe("getUser", () => {
    it("should get user profile with populated dogs and breathing logs", async () => {
      // Create test dog
      const dog = await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      });

      // Create test breathing log
      await BreathingLog.create({
        dogId: dog._id,
        userId: testUser._id,
        breathCount: 12,
        duration: 30,
        bpm: 24,
      });

      await getUser(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User profile retrieved successfully",
        data: {
          user: expect.objectContaining({
            email: testUser.email,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            dogs: expect.arrayContaining([
              expect.objectContaining({
                name: "Max",
              }),
            ]),
            breathingLogs: expect.arrayContaining([
              expect.objectContaining({
                bpm: 24,
              }),
            ]),
          }),
        },
      });
    });

    it("should return 404 if user not found", async () => {
      mockReq.user = { _id: new mongoose.Types.ObjectId() };

      await getUser(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          message: "User not found",
        })
      );
    });
  });

  describe("deleteUser", () => {
    beforeEach(() => {
      // Clear any mocks before each test
      vi.clearAllMocks();
      // vi.resetModules();
    });

    it("should delete user and all associated data", async () => {
      // Create test dog
      const dog = await Dog.create({
        userId: testUser._id,
        name: "Max",
        maxBreathingRate: 30,
      });

      // Create test breathing log
      await BreathingLog.create({
        dogId: dog._id,
        userId: testUser._id,
        breathCount: 12,
        duration: 30,
        bpm: 24,
      });

      await deleteUser(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      // Check if all data was deleted
      const deletedUser = await User.findById(testUser._id);
      const remainingDogs = await Dog.find({ userId: testUser._id });
      const remainingLogs = await BreathingLog.find({ dogId: dog._id });

      expect(deletedUser).toBeNull();
      expect(remainingDogs).toHaveLength(0);
      expect(remainingLogs).toHaveLength(0);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User account and all associated data deleted successfully",
        data: { deletedUserId: testUser._id.toString() },
      });
    });

    it("should handle database errors", async () => {
      // simulate failure
      (withTransaction as any).mockImplementationOnce(() => {
        throw new Error("Database error during user deletion");
      });

      await deleteUser(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      // Check if error was handled with the correct error message
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: "Database error during user deletion",
        })
      );

      // Verify data wasn't deleted
      const user = await User.findById(testUser._id);
      expect(user).toBeDefined();
    });
  });

  describe("updateUser", () => {
    it("should update user profile with valid data", async () => {
      const updateData: UpdateUserRequestBody = {
        firstName: "Updated",
        lastName: "Name",
        email: "updated@example.com",
      };

      mockReq.body = updateData;

      await updateUser(
        mockReq as AuthenticatedRequest & { body: UpdateUserRequestBody },
        mockRes as Response,
        mockNext
      );

      // Check database update
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.firstName).toBe("Updated");
      expect(updatedUser?.lastName).toBe("Name");
      expect(updatedUser?.email).toBe("updated@example.com");

      // Check response
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User profile updated successfully",
        data: {
          user: expect.objectContaining({
            firstName: "Updated",
            lastName: "Name",
            email: "updated@example.com",
          }),
        },
      });
    });

    it("should not allow duplicate email", async () => {
      // Create another user
      await User.create({
        email: "taken@example.com",
        password: "Password123!",
        firstName: "Other",
        lastName: "User",
      });

      mockReq.body = {
        email: "taken@example.com",
      };

      await updateUser(
        mockReq as AuthenticatedRequest & { body: UpdateUserRequestBody },
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: "Email already in use",
        })
      );
    });

    it("should hash password when updating", async () => {
      mockReq.body = {
        password: "NewPassword123!",
      };

      await updateUser(
        mockReq as AuthenticatedRequest & { body: UpdateUserRequestBody },
        mockRes as Response,
        mockNext
      );

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.password).not.toBe("NewPassword123!");
      // Password should be hashed
      expect(updatedUser?.password).toMatch(
        /^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/
      );
    });

    it("should return 400 if no valid fields to update", async () => {
      mockReq.body = {};

      await updateUser(
        mockReq as AuthenticatedRequest & { body: UpdateUserRequestBody },
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: "No valid fields to update",
        })
      );
    });
  });
});
