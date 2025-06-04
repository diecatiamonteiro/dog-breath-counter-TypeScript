/**
 * @file BreathingLog.ts
 * @description BreathingLog model
 */

import { Schema, model, Document } from "mongoose";

export interface IBreathingLog extends Document {
  dogId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  breathCount: number; // eg 12 taps/clicks
  duration: number; // eg 30 seconds
  bpm: number; // breathCount * (60 / duration) = 12 * (60 / 30) = 24
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BreathingLogSchema = new Schema<IBreathingLog>(
  {
    dogId: { type: Schema.Types.ObjectId, ref: "Dog", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    breathCount: { type: Number, required: true },
    duration: {
      type: Number,
      enum: [15, 30, 60], // seconds
      required: true,
    },
    bpm: {
      type: Number,
      required: true,
      validate: {
        validator: function () {
          return this.bpm === this.breathCount * (60 / this.duration);
        },
        message: "BPM does not match breath count and duration.",
      },
    },
    comment: { type: String },
  },
  { timestamps: true }
);

export default model<IBreathingLog>("BreathingLog", BreathingLogSchema);
