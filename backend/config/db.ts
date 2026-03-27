import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const uri = `mongodb://${env.MONGO_USERNAME}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:27017/${env.MONGO_DB}?authSource=admin`;
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
