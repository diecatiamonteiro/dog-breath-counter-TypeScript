/**
 * @desc   Wrapper for mongoose transactions so that we can ensure all deletions happen together or not at all (if any delete operation fails, nothing is deleted)
 * It is used in controllers: deleteBreathingLogById, deleteDog, deleteUser
 * @param  {TransactionCallback} callback - The callback function that contains the database operations we want to run inside a transaction
 * @returns {Promise<T>} - The result of the callback function (it returns whatever that callback returns, wrapped in a Promise<T> (generic type).)
 */

import mongoose from "mongoose";

// Declare the type for NODE_ENV to include "test"
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

// Callback function we want to run inside a transaction
type TransactionCallback = (
  session: mongoose.ClientSession | null // argument iseither a session or null if in test mode
) => Promise<any>; // returns anything, so we use any as the return type

// Wrapper for mongoose transactions (returns whatever the callback returns, Promise<T>)
export const withTransaction = async <T>(
  callback: TransactionCallback
): Promise<T> => {
  // Check if it's in test mode
  const isTestEnv = process.env.NODE_ENV === "test";

  // Prepare a session for the transaction if not in test mode; if in test mode, remains null
  let session: mongoose.ClientSession | null = null;

  try {
    if (!isTestEnv) {
      // If running in development or production, start a session for transaction to ensure all deletions happen together or not at all (if any delete operation fails, nothing is deleted); if in test environment, don't start a session and don't use transactions because test database doenst support transactions
      session = await mongoose.startSession();
      session.startTransaction();
    }

    // Run the callback function
    const result = await callback(session);

    // If not in test mode (session is not null, ie we started a real transaction), everything in this session should be applied permanently to the database
    if (session) {
      await session.commitTransaction();
    }

    // Return whatever the callback function returns so withTransaction can use it
    return result;
  } catch (error) {
    // If an error occurs, abort the transaction
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    // If a real session was started, end/close it
    if (session) {
      await session.endSession();
    }
  }
};
