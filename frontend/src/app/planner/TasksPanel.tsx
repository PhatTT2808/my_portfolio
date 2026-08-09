"use client";

import { useCallback, useState } from "react";

import { api } from "@/lib/api";
import type { Priority, Task } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";


const EMPTY = {
  title: "",
  due_date: "",
  start_time: "",
  end_time: "",
  priority: "medium" as Priority,
  notes: "",
};

const PRIORITY_STYLE: Record<Priority, string> = {
  low: "border-hairline text-muted",
  medium: "border-warning text-warning",
  high: "border-m-red text-m-red",
};

export default function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTasks(await api<Task[]>("/tasks", { auth: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    }
  }, []);

  useLoad(load);


  async function addTask(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await api("/tasks", {
        method: "POST",
        auth: true,
        body: {
          title: form.title.trim(),
          due_date: form.due_date || null,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          priority: form.priority,
          notes: form.notes.trim() || null,
        },
      });
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
  }

  async function toggle(task: Task) {
    await api(`/tasks/${task.id}`, {
      method: "PATCH",
      auth: true,
      body: { done: !task.done },
    });
    await load();
  }

  async function remove(id: string) {
    await api(`/tasks/${id}`, { method: "DELETE", auth: true });
    await load();
  }

  const openTasks = tasks.filter((task) => !task.done);
  const doneTasks = tasks.filter((task) => task.done);

  function renderTask(task: Task) {
    return (
      <li
        key={task.id}
        className={`group flex items-start justify-between gap-5 border-b border-hairline-strong py-5 transition-colors hover:bg-surface-card ${
          task.done ? "opacity-55" : ""
        }`}
      >
        <div className="flex min-w-0 items-start gap-4">
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => void toggle(task)}
            className="checkbox mt-1"
            aria-label={`Mark ${task.title} as done`}
          />
          <div className="min-w-0">
            <p
              className={`display-sm ${
                task.done ? "text-muted line-through" : ""
              }`}
            >
              {task.title}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`chip ${PRIORITY_STYLE[task.priority]}`}>
                {task.priority}
              </span>
              {task.due_date && (
                <span className="chip numeric">Due {task.due_date}</span>
              )}
              {task.start_time && task.end_time && (
                <span className="chip numeric">
                  {task.start_time.slice(0, 5)}–{task.end_time.slice(0, 5)}
                </span>
              )}
            </div>

            {task.notes && <p className="body-sm mt-3">{task.notes}</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void remove(task.id)}
          className="btn-icon shrink-0"
          aria-label={`Delete ${task.title}`}
        >
          ✕
        </button>
      </li>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
      {/* Form */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <section className="panel">
          <span className="m-stripe-thin mb-6 block w-10" />
          <h2 className="display-sm mb-2">New task</h2>
          <p className="body-sm mb-7">Capture it now, do it later.</p>

          <form onSubmit={addTask} className="flex flex-col gap-4">
            <div>
              <label htmlFor="t-title" className="field-label">
                Title
              </label>
              <input
                id="t-title"
                className="input"
                placeholder="Finish the report"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="t-due" className="field-label">
                  Due date
                </label>
                <input
                  id="t-due"
                  className="input"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="t-priority" className="field-label">
                  Priority
                </label>
                <select
                  id="t-priority"
                  className="input"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as Priority })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="t-start" className="field-label">
                  Start time · optional
                </label>
                <input
                  id="t-start"
                  className="input"
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="t-end" className="field-label">
                  End time · optional
                </label>
                <input
                  id="t-end"
                  className="input"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="t-notes" className="field-label">
                Notes · optional
              </label>
              <textarea
                id="t-notes"
                className="input h-24 py-2.5"
                placeholder="Any extra detail…"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <button type="submit" className="btn w-full" disabled={!form.title.trim()}>
              Add task
            </button>

            {error && (
              <p className="body-sm border-l-2 border-m-red pl-3 text-m-red">
                {error}
              </p>
            )}
          </form>
        </section>
      </aside>

      {/* List */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-hairline-strong pb-5">
          <h2 className="display-sm">Tasks</h2>
          <div className="flex gap-2">
            <span className="chip numeric">{openTasks.length} open</span>
            <span className="chip numeric border-success text-success">
              {doneTasks.length} done
            </span>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="border border-dashed border-hairline py-16 text-center">
            <p className="display-sm mb-2">All clear</p>
            <p className="body-sm">Nothing scheduled. Add a task to get going.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {openTasks.length > 0 && (
              <ul className="stagger flex flex-col border-t border-hairline-strong">
                {openTasks.map(renderTask)}
              </ul>
            )}

            {doneTasks.length > 0 && (
              <div>
                <p className="label-upper mb-4 text-muted">Completed</p>
                <ul className="flex flex-col border-t border-hairline-strong">
                  {doneTasks.map(renderTask)}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}