import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";

// ─── Mock mongoose model before importing controller ──────────────────────────

vi.mock("../src/models/todo.model", () => ({
  Todo: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue([
        {
          _id: "1",
          title: "Buy groceries",
          completed: false,
          createdAt: new Date(),
        },
        {
          _id: "2",
          title: "Walk the dog",
          completed: true,
          createdAt: new Date(),
        },
      ]),
    }),
    create: vi.fn().mockImplementation((data: { title: string }) =>
      Promise.resolve({
        _id: "3",
        title: data.title,
        completed: false,
        createdAt: new Date(),
      }),
    ),
  },
}));

// Import AFTER mock is set up
const { getTodos, createTodo } =
  await import("../src/controllers/todo.controller");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body = {}) => ({ body }) as Request;

// ─── Setup & Teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── GET /api/todos ───────────────────────────────────────────────────────────

describe("getTodos controller", () => {
  it("should return 200 with an array of todos", async () => {
    const req = mockRequest();
    const res = mockResponse();

    await getTodos(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: 2,
        data: expect.any(Array),
      }),
    );
  });

  it("should return count matching the number of todos", async () => {
    const req = mockRequest();
    const res = mockResponse();

    await getTodos(req, res);

    const payload = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data).toHaveLength(payload.count);
  });

  it("should return empty array when no todos exist", async () => {
    const { Todo } = await import("../src/models/todo.model");
    (Todo.find as any).mockReturnValueOnce({
      sort: vi.fn().mockResolvedValueOnce([]),
    } as any);

    const req = mockRequest();
    const res = mockResponse();

    await getTodos(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: 0,
        data: [],
      }),
    );
  });

  it("should handle database errors gracefully", async () => {
    const { Todo } = await import("../src/models/todo.model");
    const dbError = new Error("Database connection failed");
    (Todo.find as any).mockReturnValueOnce({
      sort: vi.fn().mockRejectedValueOnce(dbError),
    } as any);

    const req = mockRequest();
    const res = mockResponse();

    await getTodos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Failed to fetch todos",
      }),
    );
  });
});

// ─── POST /api/todos ──────────────────────────────────────────────────────────

describe("createTodo controller", () => {
  it("should return 201 with the created todo on valid input", async () => {
    const req = mockRequest({ title: "Learn Jenkins" });
    const res = mockResponse();

    await createTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ title: "Learn Jenkins" }),
      }),
    );
  });

  it("should return 400 when title is empty", async () => {
    const req = mockRequest({ title: "" });
    const res = mockResponse();

    await createTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Title is required"),
      }),
    );
  });

  it("should return 400 when title is null or undefined", async () => {
    const req = mockRequest({ title: null });
    const res = mockResponse();

    await createTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 400 when title contains only whitespace", async () => {
    const req = mockRequest({ title: "   " });
    const res = mockResponse();

    await createTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Title is required"),
      }),
    );
  });

  it("should trim whitespace from title before saving", async () => {
    const { Todo } = await import("../src/models/todo.model");

    const req = mockRequest({ title: "  New Task  " });
    const res = mockResponse();

    await createTodo(req, res);

    expect(Todo.create as any).toHaveBeenCalledWith({
      title: "New Task",
    });
  });

  it("should return 400 when title is not a string", async () => {
    const req = mockRequest({ title: 123 });
    const res = mockResponse();

    await createTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should handle database errors during creation", async () => {
    const { Todo } = await import("../src/models/todo.model");
    const dbError = new Error("Database write failed");
    (Todo.create as any).mockRejectedValueOnce(dbError);

    const req = mockRequest({ title: "Test Task" });
    const res = mockResponse();

    await createTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Failed to create todo",
      }),
    );
  });
});
