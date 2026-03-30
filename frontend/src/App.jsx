import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/todos`
  : "/api/todos";

function TodoItem({ todo, index, onToggle }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 60);
    return () => clearTimeout(timer);
  }, [index]);

  const date = new Date(todo.createdAt);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div
      className={`group border-b border-slate-100 last:border-transparent transition-all duration-500 bg-white hover:bg-slate-50 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-4 py-4 px-5">
        {/* Index number */}
        <span className="font-mono text-xs text-slate-400 w-6 shrink-0 select-none text-right">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Status dot */}
        <div className="shrink-0 flex items-center justify-center">
          <div
            onClick={() => onToggle?.(todo._id)}
            role="button"
            tabIndex={0}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
              todo.completed
                ? "bg-emerald-500 border-emerald-500"
                : "border-slate-300 bg-transparent group-hover:border-blue-400 hover:cursor-pointer"
            }`}
          >
            {todo.completed && (
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Title */}
        <p
          className={`flex-1 text-base leading-snug transition-all duration-300 ${
            todo.completed
              ? "text-slate-400 line-through decoration-slate-300"
              : "text-slate-700 font-medium"
          }`}
        >
          {todo.title}
        </p>

        {/* Date + time */}
        <div className="text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs font-medium text-slate-500">{formatted}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{time}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center px-6">
      <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        No tasks yet
      </h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto">
        Your task list is completely empty. Add your first task above to get
        started.
      </p>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 px-4 py-3 mb-8 rounded-xl shadow-sm">
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-red-500 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-red-700 text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-700 p-1 rounded-md hover:bg-red-100 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setTodos(json.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    setError(null);
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;

    // optimistic update
    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed: newCompleted } : t)),
    );

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setTodos((prev) => prev.map((t) => (t._id === id ? json.data : t)));
    } catch (err) {
      setError(err.message || "Failed to update task");
      // revert optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, completed: todo.completed } : t,
        ),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setTodos((prev) => [json.data, ...prev]);
      setInput("");
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message || "Failed to add task");
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
                Tasks<span className="text-blue-600">.</span>
              </h1>
              <p className="text-slate-500 mt-2 text-sm">
                Stay focused, organized, and on track.
              </p>
            </div>

            {/* Stats */}
            {!loading && totalCount > 0 && (
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-800 tracking-tight">
                  {completedCount}
                  <span className="text-slate-400 text-lg font-medium ml-1">
                    / {totalCount}
                  </span>
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Completed
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {!loading && totalCount > 0 && (
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          )}
        </header>

        {/* Error */}
        {error && (
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-2 items-stretch bg-white p-2 rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What needs to be done?"
              disabled={submitting}
              maxLength={200}
              className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 outline-none text-base px-4 py-2 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className="shrink-0 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[100px]"
            >
              {submitting ? (
                <svg
                  className="animate-spin w-5 h-5 text-white/80"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                "Add Task"
              )}
            </button>
          </div>
          {input.length > 160 && (
            <p className="text-xs text-slate-400 mt-2 font-mono text-right px-2">
              {200 - input.length} chars left
            </p>
          )}
        </form>

        {/* Task list Container */}
        <section>
          {loading ? (
            // Skeleton loader
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="border-b border-slate-100 last:border-0 py-5 px-5 flex items-center gap-4"
                >
                  <div className="w-6 h-3 bg-slate-100 rounded animate-pulse shrink-0" />
                  <div className="w-4 h-4 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div
                    className="h-3.5 bg-slate-100 rounded animate-pulse"
                    style={{
                      width: `${45 + i * 12}%`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : todos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-dashed">
              <EmptyState />
            </div>
          ) : (
            <div>
              {/* Section label */}
              <div className="flex items-center justify-between mb-3 px-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your List
                </p>
              </div>
              {/* List Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {todos.map((todo, i) => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    index={i}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 flex items-center justify-between px-2">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold">
            MERN Stack
          </p>
          <button
            onClick={fetchTodos}
            disabled={loading}
            className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;
