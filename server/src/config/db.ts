import mongoose from "mongoose";

export default async function connectDB(): Promise<void> {
  const uri = process.env.DB_URI;

  if (!uri) {
    throw new Error("DB_URI is not defined in the environment variables.");
  }

  try {
    // Connection options
    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // timeout after 5s (connection will be terminated if server does not respond within 5s)
      socketTimeoutMS: 45000, // close socket after 45s of inactivity
    };

    mongoose.connection.on("connected", () => {
      console.log(
        `✅ Successfully connected to the database: ${mongoose.connection.name}`
      );
    });

    mongoose.connection.on("error", (error) => {
      console.error("❌ Database connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("❌ Database connection disconnected");
    });

    await mongoose.connect(uri, options);
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    throw error;
  }
}
