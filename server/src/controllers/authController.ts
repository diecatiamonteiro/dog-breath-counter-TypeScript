/**
 * @file authController.ts
 * @description Controller for authentication routes: register, login, login with Google, logout, forgot password (not implemented), reset password (not implemented)
 */

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
      return next(createError(401, "User not found"));
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
      data: { user: loggedInUser },
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

    // Use the access token to get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw createError(400, "Invalid Google token");
    }

    // Extract user info from Google
    const userInfo = await userInfoResponse.json();

    // Destructure user info from Google
    const { email, given_name, family_name, id: googleId } = userInfo;

    // Check if user exists in database
    let user = await User.findOne({ googleId });

    if (user) {
      // Google-linked user already exists: sync email if changed
      if (user.email !== email) {
        const emailInUse = await User.findOne({ email, _id: { $ne: user._id } });
        if (emailInUse) {
          throw createError(400, "Email already in use by another account");
        }
        user.email = email;
        await user.save();
      }
    } else {
      // No googleId match: try by email to link accounts
      user = await User.findOne({ email });
    
      if (!user) {
        user = await User.create({
          email,
          firstName: given_name || "Unknown",
          lastName: family_name || "Unknown",
          googleId,
          password:
            Math.random().toString(36).slice(-12) +
            Math.random().toString(36).slice(-12),
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // Set JWT token in HTTP-only cookie
    setAuthCookie(user, res);

    // Remove password from response
    const loggedInGoogleUser = user.toObject() as Record<string, any>;
    delete loggedInGoogleUser.password;

    res.json({
      message: "Google login successful",
      data: { user: loggedInGoogleUser },
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
 * @access Public (no authentication required)
 */
export const logout: Controller = async (
  req,
  res,
  next
) => {
  try {
    // Clear the JWT token cookie (regardless of authentication status)
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
