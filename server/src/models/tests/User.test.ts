/**
 * @file server/src/models/tests/User.test.ts
 * @description Test suite for User model
 */

import { describe, it, expect, beforeEach } from "vitest";
import User from "../User";

describe("User Model Test", () => {
  // Clear all users before each test
  beforeEach(async () => await User.deleteMany({}));

  it("should create a user with valid fields", async () => {
    const validUser = {
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    const user = await User.create(validUser);
    expect(user.email).toBe(validUser.email);
    expect(user.password).not.toBe(validUser.password); // password's been hashed
    expect(user.firstName).toBe(validUser.firstName);
    expect(user.lastName).toBe(validUser.lastName);
    expect(user.googleId).toBeUndefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it("should validate required fields", async () => {
    const invalidUser = {
      email: "test@example.com",
      password: "password123",
      firstName: "John", // missing required lastName
    };

    await expect(User.create(invalidUser)).rejects.toThrow();
  });

  it("should create a user with googleId", async () => {
    const user = await User.create({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      googleId: "1234567890",
    });

    expect(user.googleId).toBe("1234567890");
  });

  it("should hash password when user updates their password", async () => {
    const user = await User.create({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    });

    user.password = "newpassword123";
    await user.save();

    expect(user.password).not.toBe("newpassword123");
  });

  it("should remove sensitive fields before sending data", async () => {
    const user = await User.create({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    });

    const userJson = user.toJSON();
    expect(userJson.password).toBeUndefined();
    expect(userJson.__v).toBeUndefined();
  });

  it("should not allow duplicate emails", async () => {
    const firstUser = {
      email: "same@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    const secondUser = {
      email: "same@example.com", // Same email as firstUser
      password: "differentpassword",
      firstName: "Jane",
      lastName: "Smith",
    };

    await User.create(firstUser);
    await expect(User.create(secondUser)).rejects.toThrow();
  });
});
