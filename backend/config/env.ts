/// <reference types="node" />

const requireEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  PORT: process.env["PORT"] ?? "3100",
  MONGO_HOST: requireEnv("MONGO_HOST", "mongodb"),
  MONGO_DB: requireEnv("MONGO_DB", "todo"),
  MONGO_USERNAME: requireEnv("MONGO_USERNAME"),
  MONGO_PASSWORD: requireEnv("MONGO_PASSWORD"),
  FRONTEND_URL: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
  NODE_ENV: process.env["NODE_ENV"] ?? "development",
} as const;
