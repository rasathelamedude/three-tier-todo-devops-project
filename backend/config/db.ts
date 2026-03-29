import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = (): void => {
  const uri = `mongodb://${env.MONGO_USERNAME}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:27017/${env.MONGO_DB}?authSource=admin`;

  mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
  });

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
};
