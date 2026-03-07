import { describe, it, expect, vi } from "vitest";
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
});
