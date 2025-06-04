import User from "../models/User";
import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";
import {
  GoogleLoginRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
} from "../types/userRequests";
import createError from "http-errors";
import { clearAuthCookie, setAuthCookie } from "../utils/auth";
import { OAuth2Client } from "google-auth-library";

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 * @access Public
 */
export const register: Controller<{ body: RegisterRequestBody }> = async (
  req,
  res,
  next
) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(400, "User with this email already exists");
    }

    // (password is hashed by User model pre-save middleware)
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    // Set JWT token in HTTP-only cookie
    setAuthCookie(user, res);

    res.status(201).json({
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Log in and return JWT token
 * @route  POST /api/auth/login
 * @access Public
 */
export const login: Controller<{ body: LoginRequestBody }> = async (
  req,
  res,
  next
) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(createError(401, "Invalid email or password"));
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(createError(401, "Invalid email or password"));
    }

    // Set JWT token in HTTP-only cookie
    setAuthCookie(user, res);

    // Remove password from response
    const loggedInUser = user.toObject() as Record<string, any>;
    delete loggedInUser.password;

    res.json({
      message: "Login successful",
      data: {user: loggedInUser},
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Log in or register with Google OAuth
 * @route  POST /api/auth/login/google
 * @access Public
 */
export const loginGoogle: Controller<{ body: GoogleLoginRequestBody }> = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw createError(400, "Google token is required");
    }

    // Verify the token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Extract the payload from the ticket (email, name, picture, etc.)
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw createError(400, "Invalid Google token");
    }

    const {
      email,
      given_name, // Changed from name to given_name
      family_name, // Added family_name
      sub: googleId,
    } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        email,
        firstName: given_name || "Unknown", // Use given_name for firstName
        lastName: family_name || "Unknown", // Use family_name for lastName
        googleId,
        // Generate a random password for Google users
        password:
          Math.random().toString(36).slice(-12) +
          Math.random().toString(36).slice(-12),
      });
    } else if (!user.googleId) {
      // If user exists but doesn't have googleId, link the accounts
      user.googleId = googleId;
      await user.save();
    }

    // Set JWT token in HTTP-only cookie
    setAuthCookie(user, res);

    // Remove password from response
    const loggedInGoogleUser = user.toObject() as Record<string, any>;
    delete loggedInGoogleUser.password;

    res.json({
      message: "Google login successful",
      data: {user: loggedInGoogleUser},
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Log out user (server must clear the cookie)
 * @route  GET /api/auth/logout
 * @access Protected
 */
export const logout: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
    // Clear the JWT token cookie
    clearAuthCookie(res);

    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Send reset link to user's email (token is generated here)
 * @route  POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword: Controller = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Reset password using token (token proves user identity)
 * @route  POST /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword: Controller = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
