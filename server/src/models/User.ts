/**
 * @file User.ts
 * @description User model
 */

import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  googleId?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    googleId: { type: String },
  },
  { timestamps: true }
);

// Hash password when user creates an account
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Hash password when user updates their password
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as { password?: string };
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }
  next();
});

// Compare passwords for login: compareplaintext password from the user (login form) with hashed password stored in the DB
UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields before sending data
UserSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default model<IUser>("User", UserSchema);
