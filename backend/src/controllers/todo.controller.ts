import { Request, Response } from "express";
import { Todo } from "../models/todo.model.js";

export const getTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch todos",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createTodo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      res.status(400).json({
        success: false,
        message: "Title is required and must be a non-empty string",
      });
      return;
    }

    const todo = await Todo.create({ title: title.trim() });

    res.status(201).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create todo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateTodo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      res
        .status(400)
        .json({ success: false, message: "Invalid 'completed' value" });
      return;
    }

    const todo = await Todo.findByIdAndUpdate(id, { completed }, { new: true });

    if (!todo) {
      res.status(404).json({ success: false, message: "Todo not found" });
      return;
    }

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update todo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
