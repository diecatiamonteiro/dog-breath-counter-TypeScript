import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import connectDB from "../db";

describe("Database Connection", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv }; // restore original environment variables
  });

  it("should throw an error if DB_URI is not defined", async () => {
    await mongoose.disconnect();
    process.env.DB_URI = ""; // Set DB_URI to empty string
    await expect(connectDB()).rejects.toThrow(
      "DB_URI is not defined in the environment variables."
    );
  });

  it("should connect to database successfully", async () => {
    process.env.DB_URI = (globalThis as any).MONGO_TEST_URI;
    const consoleSpy = vi.spyOn(console, "log");
    await connectDB();

    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Successfully connected to the database")
    );
  });
});
