import express from "express";
import cors from "cors";
import { env } from "../config/env";
import { connectDB } from "../config/db";
import todoRoutes from "./routes/todo.routes";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/todos", todoRoutes);

const startServer = async () => {
  console.log("Starting server...");
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });

  await connectDB();
};

startServer();

export default app;
