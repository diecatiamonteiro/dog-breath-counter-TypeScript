/**
 * @file authController.test.ts
 * @description Test suite for authController: register, login, loginGoogle, logout
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { Response } from "express";
import { login, register, loginGoogle, logout } from "../authController";
import {
  validateLoginRequest,
  validateRegisterRequest,
} from "../../middleware/validateRequest";
import User from "../../models/User";
import {
  GoogleLoginRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
} from "../../types/requests/userRequests";
import { OAuth2Client } from "google-auth-library";
import { AuthenticatedRequest } from "../../types/express";

describe("Auth Controller - Register", () => {
  let mockReq: { body: RegisterRequestBody };
  let mockRes: Partial<Response>;
  let mockNext: Mock;

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});

    mockReq = {
      body: {
        email: "test@example.com",
        password: "Password123!",
        firstName: "John",
        lastName: "Doe",
      },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    mockNext = vi.fn();
  });

  it("should register a new user successfully", async () => {
    // Run validation middleware first
    await validateRegisterRequest(
      mockReq as any,
      mockRes as Response,
      mockNext
    );
    // If validation passes, run controller
    if (!mockNext.mock.calls[0]?.[0]) {
      await register(mockReq as any, mockRes as Response, mockNext);
    }

    // Check if user was created successfully in the DB
    const user = await User.findOne({ email: mockReq.body.email });
    expect(user).toBeDefined();
    expect(user?.firstName).toBe(mockReq.body.firstName);
    expect(user?.lastName).toBe(mockReq.body.lastName);
    expect(user?.password).not.toBe(mockReq.body.password);

    // Check if response was sent successfully
    expect(mockRes.status).toHaveBeenLastCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User registered successfully",
      data: {
        user: expect.objectContaining({
          email: mockReq.body.email,
          firstName: mockReq.body.firstName,
          lastName: mockReq.body.lastName,
        }),
      },
    });

    // Check if cookie was set in the response
    expect(mockRes.cookie).toHaveBeenCalledWith(
      "jwtToken",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        secure: false, // false in test environment
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );
  });

  it("should not register user with invalid email format", async () => {
    mockReq.body.email = "invalid-email";

    await validateRegisterRequest(
      mockReq as any,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: expect.stringContaining("Invalid email"),
      })
    );
  });

  it("should not register user with weak password", async () => {
    mockReq.body.password = "weak";

    await validateRegisterRequest(
      mockReq as any,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: expect.stringContaining("Password must be"),
      })
    );
  });

  it("should not register user with existing email", async () => {
    // First create a user
    await User.create(mockReq.body);

    // Run validation middleware
    await validateRegisterRequest(
      mockReq as any,
      mockRes as Response,
      mockNext
    );
    // If validation passes, run controller
    if (!mockNext.mock.calls[0]?.[0]) {
      await register(mockReq as any, mockRes as Response, mockNext);
    }

    // Check if next function was called with error
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: "User with this email already exists",
      })
    );
  });

  it("should not register user with missing fields", async () => {
    mockReq.body.email = "";

    // Run validation middleware first
    await validateRegisterRequest(
      mockReq as any,
      mockRes as Response,
      mockNext
    );

    // If validation passes, run controller
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: "All fields are required",
      })
    );
  });

  it("should handle unexpected errors", async () => {
    // Mock User.create to throw an error
    vi.spyOn(User, "create").mockRejectedValueOnce(new Error("Database error"));

    await register(mockReq as any, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: "Database error",
      })
    );
  });
});

describe("Auth Controller - Login", () => {
  let mockReq: { body: LoginRequestBody };
  let mockRes: Partial<Response>;
  let mockNext: Mock;

  const testUser = {
    email: "test@example.com",
    password: "Password123!",
    firstName: "John",
    lastName: "Doe",
  };

  beforeEach(async () => {
    await User.deleteMany({});

    mockReq = {
      body: {
        email: testUser.email,
        password: testUser.password,
      },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    mockNext = vi.fn();

    await User.create(testUser);
  });

  it("should login user successfully with correct credentials", async () => {
    await validateLoginRequest(mockReq as any, mockRes as Response, mockNext);

    if (!mockNext.mock.calls[0]?.[0]) {
      await login(mockReq as any, mockRes as Response, mockNext);
    }

    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Login successful",
      data: {
        user: expect.objectContaining({
          email: testUser.email,
        }),
      },
    });

    expect(mockRes.cookie).toHaveBeenCalledWith(
      "jwtToken",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );
  });

  it("should not login user with incorrect password", async () => {
    mockReq.body.password = "WrongPass123!";

    await validateLoginRequest(mockReq as any, mockRes as Response, mockNext);

    if (!mockNext.mock.calls[0]?.[0]) {
      await login(mockReq as any, mockRes as Response, mockNext);
    }

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Invalid email or password",
      })
    );
  });

  it("should not login with non-existent email", async () => {
    mockReq.body.email = "nonexistent@example.com";

    await validateLoginRequest(mockReq as any, mockRes as Response, mockNext);

    if (!mockNext.mock.calls[0]?.[0]) {
      await login(mockReq as any, mockRes as Response, mockNext);
    }

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        message: "Invalid email or password",
      })
    );
  });

  it("should not login with invalid email format", async () => {
    mockReq.body.email = "invalid-email";

    await validateLoginRequest(mockReq as any, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: expect.stringContaining("Invalid email"),
      })
    );
  });

  it("should not login with missing credentials", async () => {
    mockReq.body.email = "";
    mockReq.body.password = "";

    await validateLoginRequest(mockReq as any, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: "Email and password are required",
      })
    );
  });
});

// Mock google-auth-library
vi.mock("google-auth-library", () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({
    verifyIdToken: vi.fn(),
  })),
}));

describe("Auth Controller - Google Login", () => {
  let mockReq: { body: GoogleLoginRequestBody };
  let mockRes: Partial<Response>;
  let mockNext: Mock;
  let mockVerifyIdToken: Mock;

  const mockGooglePayload = {
    email: "test@example.com",
    given_name: "John",
    family_name: "Doe",
    sub: "google123",
  };

  beforeEach(async () => {
    await User.deleteMany({});

    mockReq = {
      body: {
        token: "valid_google_token",
      },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    mockNext = vi.fn();

    // Setup OAuth2Client mock
    mockVerifyIdToken = vi.fn().mockResolvedValue({
      getPayload: () => mockGooglePayload,
    });

    // Important: Mock the implementation for each test
    (OAuth2Client as unknown as Mock).mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    }));
  });

  it("should create new user and login with valid Google token", async () => {
    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    // Check if user was created
    const user = await User.findOne({ email: mockGooglePayload.email });
    expect(user).toBeDefined();
    expect(user?.firstName).toBe("John");
    expect(user?.lastName).toBe("Doe");
    expect(user?.googleId).toBe(mockGooglePayload.sub);

    // Check response
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Google login successful",
      data: {
        user: expect.objectContaining({
          email: mockGooglePayload.email,
          firstName: "John",
          lastName: "Doe",
          googleId: mockGooglePayload.sub,
        }),
      },
    });
  });

  it("should handle invalid Google token", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("Invalid token"));

    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Invalid token"),
      })
    );
  });

  it("should handle missing payload from Google", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      getPayload: () => null,
    });

    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Invalid Google token"),
      })
    );
  });

  it("should handle missing email in payload", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({
        sub: "google123",
        given_name: "John",
        family_name: "Doe",
      }),
    });

    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Invalid Google token"),
      })
    );
  });

  it("should link Google account to existing user", async () => {
    // Create existing user without Google ID
    const existingUser = await User.create({
      email: mockGooglePayload.email,
      firstName: "Jane",
      lastName: "Smith",
      password: "Password123!",
    });

    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    // Check if Google ID was linked
    const updatedUser = await User.findById(existingUser._id);
    expect(updatedUser?.googleId).toBe(mockGooglePayload.sub);
  });
});

describe("Auth Controller - Logout", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: Mock;

  beforeEach(async () => {
    // Create mock request with authenticated user
    mockReq = {
      user: await User.create({
        email: "test@example.com",
        password: "Password123!",
        firstName: "John",
        lastName: "Doe",
      }),
      isAuthenticated: true,
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    mockNext = vi.fn();
  });

  it("should clear auth cookie and return success message", async () => {
    await logout(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.cookie).toHaveBeenCalledWith(
      "jwtToken",
      "",
      expect.objectContaining({
        httpOnly: true,
        secure: false, // false in test environment
        sameSite: "strict",
        maxAge: 0,
      })
    );

    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });

  it("should handle cookie clearing errors", async () => {
    // Mock res.cookie to throw an error
    mockRes.cookie = vi.fn().mockImplementationOnce(() => {
      throw new Error("Cookie error");
    });

    await logout(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: "Cookie error",
      })
    );
  });
});
