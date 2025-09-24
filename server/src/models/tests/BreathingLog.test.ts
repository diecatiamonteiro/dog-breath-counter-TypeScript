/**
 * @file server/src/models/tests/BreathingLog.test.ts
 * @description Test suite for BreathingLog model
 */

import { describe, it, expect, beforeEach } from "vitest";
import mongoose from "mongoose";
import BreathingLog from "../BreathingLog";

describe("BreathingLog Model Test", () => {
  // Clear all breathing logs before each test
  beforeEach(async () => {
    await BreathingLog.deleteMany({});
  });

  it("should create a breathing log with valid fields", async () => {
    const validBreathingLog = {
      dogId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      breathCount: 12,
      duration: 30,
      bpm: 24,
      comment: "Normal day",
    };

    const breathingLog = await BreathingLog.create(validBreathingLog);
    expect(breathingLog.dogId.toString()).toBe(
      validBreathingLog.dogId.toString()
    );
    expect(breathingLog.userId.toString()).toBe(
      validBreathingLog.userId.toString()
    );
    expect(breathingLog.breathCount).toBe(validBreathingLog.breathCount);
    expect(breathingLog.duration).toBe(validBreathingLog.duration);
    expect(breathingLog.bpm).toBe(validBreathingLog.bpm);
    expect(breathingLog.comment).toBe(validBreathingLog.comment);
    expect(breathingLog.createdAt).toBeDefined();
    expect(breathingLog.updatedAt).toBeDefined();
  });

  it("should validate required fields", async () => {
    const invalidBreathingLog = {
      breathCount: 12,
      duration: 30,
    };

    await expect(BreathingLog.create(invalidBreathingLog)).rejects.toThrow();
  });

  it("should validate bpm matches breath count and duration", async () => {
    const breathingLog = {
      dogId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      breathCount: 12,
      duration: 15,
      bpm: 48, // it's correct, because 12 * (60 / 15) = 48
    };

    await expect(BreathingLog.create(breathingLog)).resolves.toBeDefined();

    const invalidBpmLog = {
      ...breathingLog,
      bpm: 24, // incorrect BPM for these values
    };

    await expect(BreathingLog.create(invalidBpmLog)).rejects.toThrow();
  });
});
