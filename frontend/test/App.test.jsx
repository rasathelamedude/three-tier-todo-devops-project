import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

// ─── Mock fetch globally ──────────────────────────────────────────────────────

globalThis.fetch = vi.fn();

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Initialization Tests ─────────────────────────────────────────────────────

  describe("Initialization", () => {
    it("should render the app header with title", () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<App />);
      expect(screen.getByText("DONE")).toBeInTheDocument();
    });

    it("should fetch todos on mount", async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<App />);

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it("should display todos after successful fetch", async () => {
      const mockTodos = [
        {
          _id: "1",
          title: "Learn React",
          completed: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          title: "Learn Vitest",
          completed: true,
          createdAt: new Date().toISOString(),
        },
      ];

      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTodos }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("Learn React")).toBeInTheDocument();
        expect(screen.getByText("Learn Vitest")).toBeInTheDocument();
      });
    });

    it("should display empty state when no todos exist", async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("EMPTY")).toBeInTheDocument();
        expect(
          screen.getByText("Nothing here yet. Add your first task above."),
        ).toBeInTheDocument();
      });
    });

    it("should display error message when fetch fails", async () => {
      globalThis.fetch.mockRejectedValueOnce(new Error("Network error"));

      render(<App />);

      expect(
        await screen.findByText(
          /(Failed to fetch tasks|Test error|Network error)/,
        ),
      ).toBeInTheDocument();
    });
  });

  // ─── Form Submission Tests ────────────────────────────────────────────────────

  describe("Form Submission", () => {
    it("should add a new todo when form is submitted", async () => {
      const newTodo = {
        _id: "3",
        title: "New Task",
        completed: false,
        createdAt: new Date().toISOString(),
      };

      globalThis.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: newTodo }),
        });

      render(<App />);

      const input = screen.getByPlaceholderText("Add a new task...");
      const submitButton = screen.getByText("Add");

      await userEvent.type(input, "New Task");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("New Task")).toBeInTheDocument();
      });
    });

    it("should not submit with empty input", async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<App />);

      const submitButton = screen.getByText("Add");
      expect(submitButton).toBeDisabled();
    });

    it("should not submit with only whitespace", async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<App />);

      const input = screen.getByPlaceholderText("Add a new task...");
      const submitButton = screen.getByText("Add");

      await userEvent.type(input, "   ");
      expect(submitButton).toBeDisabled();
    });

    it("should clear input after successful submission", async () => {
      const newTodo = {
        _id: "3",
        title: "New Task",
        completed: false,
        createdAt: new Date().toISOString(),
      };

      globalThis.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: newTodo }),
        });

      render(<App />);

      const input = screen.getByPlaceholderText("Add a new task...");
      const submitButton = screen.getByText("Add");

      await userEvent.type(input, "New Task");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

    it("should handle submission errors gracefully", async () => {
      globalThis.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockRejectedValueOnce(new Error("Failed to add task"));

      render(<App />);

      const input = screen.getByPlaceholderText("Add a new task...");
      const submitButton = screen.getByText("Add");

      await userEvent.type(input, "New Task");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to add task/)).toBeInTheDocument();
      });
    });
  });

  // ─── UI Elements Tests ────────────────────────────────────────────────────────

  describe("UI Elements", () => {
    it("should display input form", async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<App />);

      const input = screen.getByPlaceholderText("Add a new task...");
      expect(input).toBeInTheDocument();
      expect(screen.getByText("Add")).toBeInTheDocument();
    });

    it("should show character count when input exceeds 160 characters", async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(<App />);

      const input = screen.getByPlaceholderText("Add a new task...");
      const longText = "a".repeat(161);

      await userEvent.type(input, longText);

      expect(screen.getByText(/chars left/)).toBeInTheDocument();
    });

    it("should display stats when todos exist", async () => {
      const mockTodos = [
        {
          _id: "1",
          title: "Task 1",
          completed: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          title: "Task 2",
          completed: true,
          createdAt: new Date().toISOString(),
        },
      ];

      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTodos }),
      });

      render(<App />);

      const completedLabel = await screen.findByText("completed");
      expect(completedLabel).toBeInTheDocument();
      const statsContainer = completedLabel.parentElement;
      expect(statsContainer).not.toBeNull();
      expect(statsContainer.textContent).toMatch(/1\s*\/\s*2/);
    });
  });

  // ─── Error Banner Tests ───────────────────────────────────────────────────────

  describe("Error Banner", () => {
    it("should dismiss error banner when close button is clicked", async () => {
      globalThis.fetch.mockRejectedValueOnce(new Error("Test error"));

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText(/(Failed to fetch tasks|Test error|Network error)/),
        ).toBeInTheDocument();
      });

      const closeButton = screen.getByText("×");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText(
            /(Failed to fetch tasks|Test error|Network error)/,
          ),
        ).not.toBeInTheDocument();
      });
    });
  });
});
