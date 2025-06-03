import BreathingLog from "../models/BreathingLog";
import Dog from "../models/Dog";
import User from "../models/User";
import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";
import { UpdateUserRequestBody } from "../types/requests/userRequests";
import createError from "http-errors";
import { validateEmail, validatePassword } from "../utils/validation";
import mongoose from "mongoose";

/**
 * @desc   Get current user profile with their dogs and breathing logs
 * @route  GET /api/user/me
 * @access Protected
 */
export const getUser: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
    // Get user, dogs, and breathing logs in parallel using Promise.all (concurrent DB queries) and destructure the results into user, dogs, and breathingLogs variables
    const [user, dogs, breathingLogs] = await Promise.all([
      User.findById(req.user?._id),
      Dog.find({ userId: req.user?._id }).sort({ createdAt: -1 }),
      BreathingLog.find({ userId: req.user?._id }).sort({ createdAt: -1 }),
    ]);

    if (!user) {
      throw createError(404, "User not found");
    }

    // Combine the data
    const userData = user.toJSON();
    const getUserData = {
      ...userData,
      dogs,
      breathingLogs,
    };

    res.json({
      message: "User profile retrieved successfully",
      data: { user: getUserData },
    });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return next(error);
    }
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Delete current user profile
 * @route  DELETE /api/user/me
 * @access Protected
 */
export const deleteUser: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  const userId = req.user?._id;

  const isTestEnv = process.env.NODE_ENV === "test";

  let session: mongoose.ClientSession | null = null;

  try {
    if (!isTestEnv) {
      // If not in test environment, start a session for transaction to ensure all deletions happen together or not at all (if any delete operation fails, nothing is deleted); if in test environment, don't start a session and don't use transactions because test database doenst support transactions
      session = await mongoose.startSession();
      session.startTransaction();
    }

    // Find all users' dogs
    const dogs = await (session
      ? Dog.find({ userId }).session(session)
      : Dog.find({ userId }));

    // Delete ALL breathing logs associated with either the user or their dogs
    await (session
      ? BreathingLog.deleteMany({
          $or: [{ userId }, { dogId: { $in: dogs.map((dog) => dog._id) } }],
        }).session(session)
      : BreathingLog.deleteMany({
          $or: [{ userId }, { dogId: { $in: dogs.map((dog) => dog._id) } }],
        }));

    // Delete all dogs from the user
    await (session
      ? Dog.deleteMany({ userId }).session(session)
      : Dog.deleteMany({ userId }));

    // Delete user
    const deletedUser = await (session
      ? User.deleteOne({ _id: userId }).session(session)
      : User.deleteOne({ _id: userId }));

    if (deletedUser.deletedCount === 0) {
      throw createError(404, "User not found");
    }

    if (session) {
      await session.commitTransaction();
    }

    res.json({
      message: "User account and all associated data deleted successfully",
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error("Failed to abort transaction:", abortErr);
      }
    }

    if (error instanceof Error) {
      const status = "status" in error ? (error as any).status : 400;
      return next(createError(status, error.message));
    }
    return next(createError(400, "Unexpected error"));
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * @desc   Update current user profile
 * @route  PATCH /api/user/me
 * @access Protected
 */
export const updateUser: Controller<
  AuthenticatedRequest & { body: UpdateUserRequestBody }
> = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const userId = req.user?._id;

    // Prepare update object
    const updateData: Partial<UpdateUserRequestBody> = {};

    if (email) {
      const sanitizedEmail = validateEmail(email);
      const existingUser = await User.findOne({
        email: sanitizedEmail,
        _id: { $ne: userId }, // exclude current user
      });

      if (existingUser) {
        throw createError(400, "Email already in use");
      }

      updateData.email = sanitizedEmail;
    }

    if (password) {
      validatePassword(password);
      updateData.password = password;
    }

    if (firstName) {
      updateData.firstName = firstName.trim();
    }

    if (lastName) {
      updateData.lastName = lastName.trim();
    }

    if (Object.keys(updateData).length === 0) {
      throw createError(400, "No valid fields to update");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true } // return the updated user
    );

    if (!updatedUser) {
      throw createError(404, "User not found");
    }

    res.json({
      message: "User profile updated successfully",
      data: {user: updatedUser},
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};
