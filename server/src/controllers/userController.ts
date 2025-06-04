import BreathingLog from "../models/BreathingLog";
import Dog from "../models/Dog";
import User from "../models/User";
import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";
import { UpdateUserRequestBody } from "../types/userRequests";
import createError from "http-errors";
import { validateEmail, validatePassword } from "../utils/validation";
import mongoose from "mongoose";
import { withTransaction } from "../utils/transaction";

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

  try {
    const result = await withTransaction(async (session) => {
      // First find the user
      const userToDelete = await User.findOne({ _id: userId }).session(session);

      if (!userToDelete) {
        throw createError(404, "User not found");
      }

      // Find all user's dogs
      const dogs = await Dog.find({ userId }).session(session);

      // Delete ALL breathing logs
      await BreathingLog.deleteMany({
        $or: [{ userId }, { dogId: { $in: dogs.map((dog) => dog._id) } }],
      }).session(session);

      // Delete all dogs
      await Dog.deleteMany({ userId }).session(session);

      // Delete the user
      await userToDelete.deleteOne({ session });

      // Return the user ID so FE knows which user to remove from state
      return userId.toString();
    });

    res.json({
      message: "User account and all associated data deleted successfully",
      data: { deletedUserId: result }, // So FE knows which user to remove from state
    });
  } catch (error) {
    if (error instanceof createError.HttpError) {
      return next(error);
    }
    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid user ID format"));
    }
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
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
      data: { user: updatedUser },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};
