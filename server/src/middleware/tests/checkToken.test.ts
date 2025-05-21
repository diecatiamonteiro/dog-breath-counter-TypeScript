import { describe, it, expect, vi, beforeEach } from "vitest";
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import checkToken from "../checkToken";
import { AuthenticatedRequest } from "../../types/express";
import User from "../../models/User";
import mongoose from "mongoose";

describe("checkToken Middleware", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockUser: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock user, request and response objects, and next function
    mockUser = await User.create({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    });

    mockReq = {
      cookies: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    mockNext = vi.fn();
  });

  it("should return 401 if no token is provided", async () => {
    await checkToken(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Unauthorized request, no token provided",
      })
    );
  });

  it("should return 401 if token is invalid", async () => {
    mockReq.cookies = { jwtToken: "invalid-token" };

    await checkToken(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Invalid or expired token",
      })
    );
  });

  it("should return 401 if user is not found", async () => {
    // Create a token with a non-existent user ID
    const nonExistentId = new mongoose.Types.ObjectId();
    const token = jwt.sign(
      { id: nonExistentId },
      process.env.JWT_SECRET || "test-secret"
    );
    mockReq.cookies = { jwtToken: token };

    await checkToken(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "User not found",
      })
    );
  });

  it("should successfully authenticate with valid token", async () => {
    // Create a valid token with our mock user
    const token = jwt.sign(
      { id: mockUser._id },
      process.env.JWT_SECRET || "test-secret"
    );
    mockReq.cookies = { jwtToken: token };

    await checkToken(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    // Check if user and isAuthenticated were attached to request
    expect(mockReq.user?.id).toBe(mockUser.id);
    expect(mockReq.isAuthenticated).toBe(true);

    // Check if next was called without error
    expect(mockNext).toHaveBeenCalledWith();
  });
});
