import Dog from "../models/Dog";
import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";
import createError from "http-errors";
import {
  CreateDogRequestBody,
  UpdateDogRequestBody,
} from "../types/requests/userRequests";
import mongoose from "mongoose";
import BreathingLog from "../models/BreathingLog";
/**
 * @desc   Get all dogs from the logged-in user
 * @route  GET /api/dogs
 * @access Protected
 */
export const getAllDogs: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
    const allDogs = await Dog.find({ userId: req.user?._id }).sort({
      createdAt: -1, // ascending order
    });

    res.json({
      message: "Dogs retrieved successfully",
      data: { dogs: allDogs },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Add a new dog
 * @route  POST /api/dogs
 * @access Protected
 */
export const createDog: Controller<
  AuthenticatedRequest & { body: CreateDogRequestBody }
> = async (req, res, next) => {
  try {
    const dogData = { ...req.body, userId: req.user?._id };
    const newDog = await Dog.create(dogData);

    res.status(201).json({
      message: "Dog created successfully",
      data: { dog: newDog },
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Get a specific dog profile by ID
 * @route  GET /api/dogs/:id
 * @access Protected
 */
export const getDogById: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
    const dog = await Dog.findOne({
      _id: req.params.id, // find dog by route params (dogs/:id)
      userId: req.user?._id, // find dog by user id
    });

    if (!dog) {
      throw createError(404, "Dog not found");
    }

    res.json({
      message: "Dog retrieved successfully by ID",
      data: { dog },
    });
  } catch (error) {
    // Pass through the error if it's already an HttpError (like previous 404)
    if (error instanceof createError.HttpError) {
      return next(error);
    }
    // Handle other errors
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Update a specific dog profile by ID
 * @route  PATCH /api/dogs/:id
 * @access Protected
 */
export const updateDog: Controller<
  AuthenticatedRequest & { body: UpdateDogRequestBody }
> = async (req, res, next) => {
  try {
    const updatedDog = await Dog.findOneAndUpdate(
      {
        _id: req.params.id, // find dog by route params (dogs/:id)
        userId: req.user?._id, // find dog by user id
      },
      req.body, // update the dog with the new data
      { new: true, runValidators: true } // return the new updated dog
    );

    if (!updatedDog) {
      throw createError(404, "Dog not found");
    }

    res.json({
      message: "Dog updated successfully",
      data: { dog: updatedDog },
    });
  } catch (error) {
    // Pass through the error if it's already an HttpError (like previous 404)
    if (error instanceof createError.HttpError) {
      return next(error);
    }
    // Handle other errors
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Delete a specific dog profile by ID and all associated breathing logs
 * @route  DELETE /api/dogs/:id
 * @access Protected
 */
export const deleteDog: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  const isTestEnv = process.env.NODE_ENV === "test";
  let session: mongoose.ClientSession | null = null; // prepare a session for the transaction

  try {
    if (!isTestEnv) {
      // If not in test environment, start a session for transaction to ensure all deletions happen together or not at all (if any delete operation fails, nothing is deleted); if in test environment, don't start a session and don't use transactions because test database doenst support transactions
      session = await mongoose.startSession();
      session.startTransaction();
    }

    // Find the dog to delete
    const dogToDelete = await (session
      ? Dog.findOne({
          _id: req.params.id,
          userId: req.user?._id,
        }).session(session)
      : Dog.findOne({
          _id: req.params.id,
          userId: req.user?._id,
        }));

    if (!dogToDelete) {
      throw createError(404, "Dog not found");
    }

    // Delete all breathing logs associated with the dog
    await (session
      ? BreathingLog.deleteMany({ dogId: dogToDelete._id }).session(session)
      : BreathingLog.deleteMany({ dogId: dogToDelete._id }));

    // Delete the dog
    await (session
      ? dogToDelete.deleteOne({ session })
      : dogToDelete.deleteOne());

    // If everything went well, commit the transaction, ie permanently delete the dog and breathing logs
    if (session) {
      await session.commitTransaction();
    }

    res.json({
      message: "Dog and associated breathing logs deleted successfully",
      data: { deletedDogId: req.params.id }, // So FE knows which dog to remove from state
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }

    if (error instanceof createError.HttpError) {
      return next(error);
    }

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid dog ID format"));
    }

    if (error instanceof Error) {
      return next(createError(400, error.message));
    }

    return next(createError(500, "An unexpected error occurred"));
  }
};
