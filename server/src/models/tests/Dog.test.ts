import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import Dog from "../Dog";

describe("Dog Model Test", () => {
  // Clear all dogs before each test
  beforeEach(async () => {
    await Dog.deleteMany({});
  });

  it("should create a dog with valid fields", async () => {
    const validDog = {
      userId: new mongoose.Types.ObjectId(),
      name: "Max",
      birthYear: 2020,
      gender: "male",
      maxBreathingRate: 25,
      veterinarian: {
        name: "Dr. Smith",
        email: "dr.smith@example.com",
      },
    };

    const dog = await Dog.create(validDog);
    expect(dog.userId.toString()).toBe(validDog.userId.toString());
    expect(dog.name).toBe("Max");
    expect(dog.photo).toBeUndefined();
    expect(dog.breed).toBeUndefined();
    expect(dog.birthYear).toBe(2020);
    expect(dog.gender).toBe("male");
    expect(dog.maxBreathingRate).toBe(25);
    expect(dog.veterinarian?.name).toBe("Dr. Smith");
    expect(dog.veterinarian?.email).toBe("dr.smith@example.com");
    expect(dog.veterinarian?.clinicName).toBeUndefined();
    expect(dog.veterinarian?.phoneNumber).toBeUndefined();
    expect(dog.veterinarian?.address).toBeUndefined();
    expect(dog.age).toBe(new Date().getFullYear() - 2020);
    expect(dog.createdAt).toBeDefined();
    expect(dog.updatedAt).toBeDefined();
  });

  it("should validate required fields", async () => {
    const invalidDog = {
      maxBreathingRate: 25, // missing required name and userId
    };

    await expect(Dog.create(invalidDog)).rejects.toThrow();
  });

  it("should validate breathing rate range", async () => {
    const dogWithInvalidRate = {
      userId: new mongoose.Types.ObjectId(),
      name: "Max",
      maxBreathingRate: 61, // exceeds maximum of 60
    };

    await expect(Dog.create(dogWithInvalidRate)).rejects.toThrow();
  });

  it("should validate birth year", async () => {
    const dogWithFutureYear = {
      userId: new mongoose.Types.ObjectId(),
      name: "Max",
      birthYear: new Date().getFullYear() + 1,
    };

    await expect(Dog.create(dogWithFutureYear)).rejects.toThrow();
  });

  it("should calculate age correctly", async () => {
    const dog = await Dog.create({
      userId: new mongoose.Types.ObjectId(),
      name: "Max",
      birthYear: 2015,
    });

    expect(dog.age).toBe(new Date().getFullYear() - 2015); // 2025 - 2015 = 10
  });
});
