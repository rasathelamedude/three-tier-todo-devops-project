import { Router } from "express";
import {
  getTodos,
  createTodo,
  updateTodo,
} from "../controllers/todo.controller.js";

const router = Router();

router.get("/", getTodos);
router.post("/", createTodo);
router.patch("/:id", updateTodo);

export default router;
