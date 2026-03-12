import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/todos`
  : "/api/todos";

function TodoItem({ todo, index }) {
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
      className={`group border-b border-border transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-4 py-4 px-1">
        {/* Index number */}
        <span
          className="font-mono text-xs text-muted pt-1 w-6 shrink-0 select-none"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Status dot */}
        <div className="pt-1.5 shrink-0">
          <div
            className={`w-2.5 h-2.5 rounded-full border transition-colors duration-300 ${
              todo.completed
                ? "bg-done border-done"
                : "border-muted bg-transparent"
            }`}
          />
        </div>

        {/* Title */}
        <p
          className={`flex-1 font-body text-base leading-snug transition-colors duration-300 ${
            todo.completed
              ? "text-muted line-through decoration-done decoration-1"
              : "text-ink"
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {todo.title}
        </p>

        {/* Date + time */}
        <div
          className="text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          <p className="text-xs text-muted">{formatted}</p>
          <p className="text-xs text-muted/60">{time}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <div
        className="text-6xl font-display font-black text-border select-none leading-none mb-3"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        EMPTY
      </div>
      <p
        className="text-muted text-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Nothing here yet. Add your first task above.
      </p>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-center justify-between bg-accent/10 border border-accent/30 px-4 py-3 mb-6 rounded-sm">
      <p
        className="text-accent text-sm"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        ✕ {message}
      </p>
      <button
        onClick={onDismiss}
        className="text-accent/60 hover:text-accent text-lg leading-none ml-4 transition-colors"
      >
        ×
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
    <div className="min-h-screen bg-paper">
      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-end justify-between mb-2">
            <h1
              className="text-7xl font-black leading-none tracking-tight text-ink"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              DONE<span className="text-accent">.</span>
            </h1>

            {/* Stats */}
            {!loading && totalCount > 0 && (
              <div
                className="text-right pb-2"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                <p className="text-2xl font-medium text-ink">
                  {completedCount}
                  <span className="text-muted text-base font-normal">
                    /{totalCount}
                  </span>
                </p>
                <p className="text-xs text-muted uppercase tracking-widest">
                  completed
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {!loading && totalCount > 0 && (
            <div className="h-px bg-border mt-6 relative overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-done transition-all duration-700 ease-out"
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
          <div className="flex gap-3 items-stretch border-b-2 border-ink pb-1 focus-within:border-accent transition-colors duration-200">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
              disabled={submitting}
              maxLength={200}
              className="flex-1 bg-transparent text-ink placeholder:text-muted outline-none text-base py-2 disabled:opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className="shrink-0 px-4 py-2 bg-accent text-paper text-sm font-medium tracking-wide uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ink transition-colors duration-200"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin w-3.5 h-3.5"
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
                  Adding
                </span>
              ) : (
                "Add"
              )}
            </button>
          </div>
          {input.length > 160 && (
            <p
              className="text-xs text-muted mt-1 text-right"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {200 - input.length} chars left
            </p>
          )}
        </form>

        {/* Task list */}
        <section>
          {/* Section label */}
          {!loading && totalCount > 0 && (
            <p
              className="text-xs uppercase tracking-[0.15em] text-muted mb-4"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              — Tasks ({totalCount})
            </p>
          )}

          {loading ? (
            // Skeleton loader
            <div className="space-y-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="border-b border-border py-4 flex items-center gap-4"
                >
                  <div className="w-6 h-3 bg-border rounded animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border animate-pulse" />
                  <div
                    className="h-4 bg-border rounded animate-pulse"
                    style={{
                      width: `${45 + i * 12}%`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : todos.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              {todos.map((todo, i) => (
                <TodoItem key={todo._id} todo={todo} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-border flex items-center justify-between">
          <p
            className="text-xs text-muted/60 uppercase tracking-widest"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            three-tier · mongo · express · react
          </p>
          <button
            onClick={fetchTodos}
            disabled={loading}
            className="text-xs text-muted hover:text-accent transition-colors duration-200 disabled:opacity-30"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            ↻ refresh
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;
