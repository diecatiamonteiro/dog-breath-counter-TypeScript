import Dog from "../models/Dog";
import { Controller } from "../types/controller";
import { AuthenticatedRequest } from "../types/express";
import createError from "http-errors";
import {
  CreateDogRequestBody,
  UpdateDogRequestBody,
} from "../types/userRequests";
import mongoose from "mongoose";
import BreathingLog from "../models/BreathingLog";
import { withTransaction } from "../utils/transaction";
import { cloudinaryService } from "../services/cloudinaryService";
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
    // Validate required fields
    if (!req.body.name || !req.body.maxBreathingRate) {
      throw createError(400, "Name and maxBreathingRate are required");
    }

    const dogData = {
      ...req.body,
      userId: req.user?._id,
    };

    // Photo is already validated by middleware
    const newDog = await Dog.create(dogData);

    res.status(201).json({
      message: "Dog created successfully",
      data: { dog: newDog },
    });
  } catch (error) {
    // If dog creation fails and we have a photo, clean it up
    if (error && req.body.photo) {
      await cloudinaryService.cleanup(req.body.photo);
    }

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
    // Find the dog first
    const existingDog = await Dog.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!existingDog) {
      throw createError(404, "Dog not found");
    }

    // Handle photo update if needed
    if (req.body.photo) {
      // At this point req.body.photo is validated by validatePhotoData middleware
      if (existingDog.photo && existingDog.photo.publicId) {
        await cloudinaryService.deletePhoto(existingDog.photo.publicId);
      }
    }

    // Prepare update data with all possible fields
    const updateData = {
      name: req.body.name ?? existingDog.name,
      photo: req.body.photo ?? existingDog.photo,
      breed: req.body.breed ?? existingDog.breed,
      birthYear: req.body.birthYear ?? existingDog.birthYear,
      gender: req.body.gender ?? existingDog.gender,
      maxBreathingRate: req.body.maxBreathingRate ?? existingDog.maxBreathingRate,
      veterinarian: {
        ...existingDog.veterinarian,
        ...req.body.veterinarian
      }
    };

    const updatedDog = await Dog.findByIdAndUpdate(
      existingDog._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Dog updated successfully",
      data: { dog: updatedDog },
    });
  } catch (error) {
    // If update fails and we were trying to update the photo, clean up the new photo
    if (error && req.body.photo) {
      await cloudinaryService.cleanup(req.body.photo);
    }

    if (error instanceof createError.HttpError) {
      return next(error);
    }
    if (error instanceof Error) {
      return next(createError(400, error.message));
    }
    return next(createError(500, "An unexpected error occurred"));
  }
};

/**
 * @desc   Delete a specific dog profile by ID and all associated data
 * @route  DELETE /api/dogs/:id
 * @access Protected
 */
export const deleteDog: Controller<AuthenticatedRequest> = async (
  req,
  res,
  next
) => {
  try {
    const result = await withTransaction(async (session) => {
      // Find the dog to delete
      const dogToDelete = await Dog.findOne({
        _id: req.params.id,
        userId: req.user?._id,
      }).session(session);

      if (!dogToDelete) {
        throw createError(404, "Dog not found");
      }

      // Delete the photo from Cloudinary if it exists
      if (dogToDelete.photo?.publicId) {
        await cloudinaryService.deletePhoto(dogToDelete.photo.publicId);
      }

      // Delete all breathing logs associated with the dog
      await BreathingLog.deleteMany({ dogId: dogToDelete._id }).session(session);

      // Delete the dog
      await dogToDelete.deleteOne({ session });

      return (dogToDelete._id as mongoose.Types.ObjectId).toString();
    });

    res.json({
      message: "Dog and all associated data deleted successfully",
      data: { deletedDogId: result },
    });
  } catch (error) {
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
