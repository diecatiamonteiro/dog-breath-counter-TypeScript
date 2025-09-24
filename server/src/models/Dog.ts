/**
 * @file server/src/models/Dog.ts
 * @description Dog model
 */

import { Schema, model, Document } from "mongoose";
import { CloudinaryPhoto } from "../types/cloudinary";

export interface IDog extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  photo?: CloudinaryPhoto;
  breed?: string;
  birthYear?: number;
  gender?: string;
  maxBreathingRate: number;
  veterinarian?: {
    name?: string;
    clinicName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
  };
  age?: number; // virtual field (not stored in DB)
  createdAt: Date;
  updatedAt: Date;
}

const DogSchema = new Schema<IDog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    photo: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      },
      required: false
    },
    breed: { type: String },
    birthYear: {
      type: Number,
      validate: {
        validator: function (value: number) {
          const currentYear = new Date().getFullYear();
          return !value || (value >= 2000 && value <= currentYear);
        },
        message: "Invalid birth year",
      },
    },
    gender: { type: String, enum: ["male", "female"] },
    maxBreathingRate: {
      type: Number,
      default: 30,
      required: true,
      min: [1, "Breathing rate must be at least 1"],
      max: [60, "Breathing rate cannot exceed 60"],
    },
    veterinarian: {
      name: { type: String },
      clinicName: { type: String },
      phoneNumber: { type: String },
      email: { type: String },
      address: { type: String },
    },
  },
  { timestamps: true }
);

// Create a virtual field 'age' that dynamically calculates the dog's current age based on the birth year
// A virtual is a field that is not stored in the DB but is calculated based on other fields
DogSchema.virtual("age").get(function (this: IDog) {
  return this.birthYear ? new Date().getFullYear() - this.birthYear : undefined;
});

// Include virtual fields when converting document to JSON and to plain JS object
DogSchema.set("toJSON", { 
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
DogSchema.set("toObject", { virtuals: true });

export default model<IDog>("Dog", DogSchema);
