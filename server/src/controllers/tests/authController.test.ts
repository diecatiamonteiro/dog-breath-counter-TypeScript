/**
 * @file server/src/controllers/tests/authController.test.ts
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
} from "../../types/userRequests";
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
        sameSite: "lax",
        path: "/",
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
        sameSite: "lax",
        path: "/",
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
        message: "User not found",
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

// Mock fetch for Google API calls
global.fetch = vi.fn();

describe("Auth Controller - Google Login", () => {
  let mockReq: { body: GoogleLoginRequestBody };
  let mockRes: Partial<Response>;
  let mockNext: Mock;

  const mockGoogleUserInfo = {
    email: "test@example.com",
    given_name: "John",
    family_name: "Doe",
    id: "google123",
  };

  beforeEach(async () => {
    await User.deleteMany({});

    mockReq = {
      body: {
        token: "valid_google_access_token",
      },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    mockNext = vi.fn();

    // Mock successful Google API response
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGoogleUserInfo),
    });
  });

  it("should create new user and login with valid Google token", async () => {
    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    // Check if fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: 'Bearer valid_google_access_token',
        },
      }
    );

    // Check if user was created (lookup by googleId first, then email)
    const user = await User.findOne({ googleId: mockGoogleUserInfo.id });
    expect(user).toBeDefined();
    expect(user?.firstName).toBe("John");
    expect(user?.lastName).toBe("Doe");
    expect(user?.googleId).toBe(mockGoogleUserInfo.id);
    expect(user?.email).toBe(mockGoogleUserInfo.email);

    // Check response
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Google login successful",
      data: {
        user: expect.objectContaining({
          email: mockGoogleUserInfo.email,
          firstName: "John",
          lastName: "Doe",
          googleId: mockGoogleUserInfo.id,
        }),
      },
    });
  });

  it("should handle invalid Google token", async () => {
    // Mock failed Google API response
    (fetch as Mock).mockResolvedValue({
      ok: false,
      statusText: "Unauthorized",
    });

    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Invalid Google token"),
      })
    );
  });

  it("should handle missing email in user info", async () => {
    // Mock Google API response without email
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        given_name: "John",
        family_name: "Doe",
        id: "google123",
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
      email: mockGoogleUserInfo.email,
      firstName: "Jane",
      lastName: "Smith",
      password: "Password123!",
    });

    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    // Check if Google ID was linked
    const updatedUser = await User.findById(existingUser._id);
    expect(updatedUser?.googleId).toBe(mockGoogleUserInfo.id);
  });

  it("should sync email when Google user's email changes", async () => {
    // Create existing Google user with different email
    const existingUser = await User.create({
      email: "old@example.com",
      firstName: "John",
      lastName: "Doe",
      googleId: mockGoogleUserInfo.id,
      password: "Password123!",
    });

    // Mock Google response with new email
    const newEmail = "new@example.com";
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ...mockGoogleUserInfo,
        email: newEmail,
      }),
    });

    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    // Check if email was synced
    const updatedUser = await User.findById(existingUser._id);
    expect(updatedUser?.email).toBe(newEmail);
    expect(updatedUser?.googleId).toBe(mockGoogleUserInfo.id);
  });

  it("should reject when Google email is already in use by another account", async () => {
    // Create existing user with different googleId
    await User.create({
      email: mockGoogleUserInfo.email,
      firstName: "Jane",
      lastName: "Smith",
      googleId: "different-google-id",
      password: "Password123!",
    });

    // Create another user with the googleId we're trying to sync
    const currentUser = await User.create({
      email: "current@example.com",
      firstName: "John",
      lastName: "Doe",
      googleId: mockGoogleUserInfo.id,
      password: "Password123!",
    });

    await loginGoogle(mockReq as any, mockRes as Response, mockNext);

    // Should call next with error
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: "Email already in use by another account",
      })
    );
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
        sameSite: "lax",
        path: "/",
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
