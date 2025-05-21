/**
 * @file setup.ts
 * @description Global test setup file for Vitest using MongoMemoryServer and Mongoose.
 * This file prepares a clean, temporary DB environment for each test run using Vitest + Mongoose + MongoMemoryServer.
 * Add this file to `test.setupFiles` in `vitest.config.ts`.
 */

import { beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

/**
 * Set up a fake MongoDB database, so tests don't touch real database:
 * 1- Create an in-memory MongoDB
 * 2- Get the temporary MongoDB URI
 * 3- Store the URI in the globalThis object, so it can be used in tests
 * 4- Connect Mongoose to this in-memory DB
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  (globalThis as any).MONGO_TEST_URI = mongoUri;
  await mongoose.connect(mongoUri);
});

/**
 * Clean up everything to free memory and prevent leaks:
 * 1- Disconnect Mongoose from the fake DB
 * 2- Stop the fake DB
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

/**
 * Clear all data from each collection, so each test starts fresh without leftover data from the previous one
 * 1- Get all collections in in-memory DB
 * 2- Clear all data from each collection
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
