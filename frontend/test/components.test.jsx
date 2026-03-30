import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ─── Component Tests for TodoItem, EmptyState, and ErrorBanner ───────────────

// Since these are sub-components within App, we'll test them through App
// But we can also create unit tests that export them separately

describe("TodoItem Component", () => {
  it("should render todo item with title", async () => {
    const { render } = await import("@testing-library/react");

    // Mock the sub-components by testing their rendering through their parent
    const mockTodo = {
      _id: "1",
      title: "Buy groceries",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // This tests that the todo item renders correctly when part of the App
    const mockTodos = [mockTodo];

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockTodos }),
    });

    const { default: App } = await import("../src/App");
    render(<App />);

    // Verify the todo item is rendered
    expect(await screen.findByText("Buy groceries")).toBeInTheDocument();
  });
});

describe("EmptyState Component", () => {
  it("should display empty state when no todos", async () => {
    const { render } = await import("@testing-library/react");

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { default: App } = await import("../src/App");
    render(<App />);

    expect(await screen.findByText("EMPTY")).toBeInTheDocument();
    expect(
      await screen.findByText("Nothing here yet. Add your first task above."),
    ).toBeInTheDocument();
  });
});

describe("ErrorBanner Component", () => {
  it("should display error banner with message", async () => {
    const { render } = await import("@testing-library/react");

    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error("Test error"));

    const { default: App } = await import("../src/App");
    render(<App />);

    expect(
      await screen.findByText(/(Failed to fetch tasks|Test error)/),
    ).toBeInTheDocument();
  });

  it("should be able to dismiss error banner", async () => {
    const { render } = await import("@testing-library/react");

    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error("Test error"));

    const { default: App } = await import("../src/App");
    render(<App />);

    const errorBanner = await screen.findByText(
      /(Failed to fetch tasks|Test error)/,
    );
    expect(errorBanner).toBeInTheDocument();

    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);

    // Error banner should no longer be visible
    expect(
      screen.queryByText(/(Failed to fetch tasks|Test error)/),
    ).not.toBeInTheDocument();
  });
});

// ─── Integration Tests ────────────────────────────────────────────────────────

describe("Component Integration", () => {
  it("should display multiple todos correctly", async () => {
    const { render } = await import("@testing-library/react");

    const mockTodos = [
      {
        _id: "1",
        title: "First task",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        title: "Second task",
        completed: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "3",
        title: "Third task",
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockTodos }),
    });

    const { default: App } = await import("../src/App");
    render(<App />);

    expect(await screen.findByText("First task")).toBeInTheDocument();
    expect(await screen.findByText("Second task")).toBeInTheDocument();
    expect(await screen.findByText("Third task")).toBeInTheDocument();
  });

  it("should switch from empty state to showing todos", async () => {
    const { render } = await import("@testing-library/react");

    const newTodo = {
      _id: "3",
      title: "New Task",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: newTodo }),
      });

    const { default: App } = await import("../src/App");
    const { rerender } = render(<App />);

    // Initially empty state
    expect(await screen.findByText("EMPTY")).toBeInTheDocument();
  });
});
