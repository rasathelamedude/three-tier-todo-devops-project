import { vi } from "vitest";

/**
 * Mock fetch with common response utilities
 */
export function mockFetch(response = {}, options = {}) {
  const {
    ok = true,
    status = 200,
    headers = { "Content-Type": "application/json" },
  } = options;

  return vi.fn().mockResolvedValue({
    ok,
    status,
    headers,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
}

/**
 * Mock fetch to reject with an error
 */
export function mockFetchError(error = new Error("Network error")) {
  return vi.fn().mockRejectedValue(error);
}

/**
 * Create a mock todo object
 */
export function createMockTodo(overrides = {}) {
  return {
    _id: "1",
    title: "Test Todo",
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create multiple mock todos
 */
export function createMockTodos(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    _id: String(i + 1),
    title: `Todo ${i + 1}`,
    completed: i % 2 === 0,
    createdAt: new Date().toISOString(),
  }));
}
