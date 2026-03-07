const requireEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  PORT: process.env["PORT"] ?? "5000",
  MONGO_URI: requireEnv("MONGO_URI", "mongodb://localhost:27017/tododb"),
  FRONTEND_URL: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
  NODE_ENV: process.env["NODE_ENV"] ?? "development",
} as const;
