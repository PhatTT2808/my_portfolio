"use client";

import { useCallback, useState } from "react";

import { api } from "@/lib/api";
import type { Priority, ScheduleSlot, Task } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EMPTY = {
  subject: "",
  weekday: 0,
  start_time: "08:00",
  end_time: "09:30",
  location: "",
};

const PRIORITY_STYLE: Record<Priority, string> = {
  low: "border-hairline text-muted",
  medium: "border-warning text-warning",
  high: "border-m-red text-m-red",
};

/** Parse a `YYYY-MM-DD` date string as a local calendar date (no UTC shift). */
function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Convert a local Date to the Monday-first weekday index used by the timetable. */
function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export default function SchedulePanel() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [schedule, taskList] = await Promise.all([
        api<ScheduleSlot[]>("/schedule", { auth: true }),
        api<Task[]>("/tasks", { auth: true }),
      ]);
      setSlots(schedule);
      setTasks(taskList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timetable");
    }
  }, []);

  useLoad(load);

  async function addSlot(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await api("/schedule", {
        method: "POST",
        auth: true,
        body: {
          subject: form.subject.trim(),
          weekday: Number(form.weekday),
          start_time: form.start_time,
          end_time: form.end_time,
          location: form.location.trim() || null,
        },
      });
      setForm({ ...EMPTY, weekday: form.weekday });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add slot");
    }
  }

  async function remove(id: string) {
    await api(`/schedule/${id}`, { method: "DELETE", auth: true });
    await load();
  }

  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
      {/* Form */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <section className="panel">
          <span className="m-stripe-thin mb-6 block w-10" />
          <h2 className="display-sm mb-2">Add a class</h2>
          <p className="body-sm mb-7">
            {slots.length} {slots.length === 1 ? "slot" : "slots"} in your week.
          </p>

          <form onSubmit={addSlot} className="flex flex-col gap-4">
            <div>
              <label htmlFor="s-subject" className="field-label">
                Subject
              </label>
              <input
                id="s-subject"
                className="input"
                placeholder="Advanced Mathematics"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="s-day" className="field-label">
                Day
              </label>
              <select
                id="s-day"
                className="input"
                value={form.weekday}
                onChange={(e) =>
                  setForm({ ...form, weekday: Number(e.target.value) })
                }
              >
                {DAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="s-start" className="field-label">
                  Start
                </label>
                <input
                  id="s-start"
                  className="input"
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="s-end" className="field-label">
                  End
                </label>
                <input
                  id="s-end"
                  className="input"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="s-location" className="field-label">
                Location · optional
              </label>
              <input
                id="s-location"
                className="input"
                placeholder="Room B2-401"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn w-full"
              disabled={!form.subject.trim()}
            >
              Add to timetable
            </button>

            {error && (
              <p className="body-sm border-l-2 border-m-red pl-3 text-m-red">
                {error}
              </p>
            )}
          </form>
        </section>
      </aside>

      {/* Timetable */}
      <section>
        <h2 className="display-sm mb-6 border-b border-hairline-strong pb-5">
          Weekly timetable
        </h2>

        <div className="stagger grid border-t border-l border-hairline-strong sm:grid-cols-2 xl:grid-cols-3">
          {DAYS.map((day, index) => {
            const daySlots = slots
              .filter((slot) => slot.weekday === index)
              .sort((a, b) => a.start_time.localeCompare(b.start_time));
            const dayTasks = tasks
              .filter(
                (task) =>
                  task.due_date &&
                  weekdayIndex(parseDateOnly(task.due_date)) === index,
              )
              .sort((a, b) =>
                (a.start_time ?? "24:00").localeCompare(
                  b.start_time ?? "24:00",
                ),
              );
            const itemCount = daySlots.length + dayTasks.length;
            const isToday = index === todayIndex;

            return (
              <div
                key={day}
                className={`border-r border-b border-hairline-strong ${
                  isToday ? "bg-surface-card" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-hairline-strong px-4 py-3">
                  <h3 className="label-upper">{day}</h3>
                  {isToday ? (
                    <span className="chip border-ink text-ink">Today</span>
                  ) : (
                    <span className="caption numeric">{itemCount}</span>
                  )}
                </div>

                {itemCount === 0 ? (
                  <p className="caption px-4 py-7 text-center">Free day</p>
                ) : (
                  <ul className="divide-y divide-hairline-strong">
                    {daySlots.map((slot) => (
                      <li
                        key={slot.id}
                        className="group flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated"
                      >
                        <div className="flex min-w-0 gap-3">
                          <span
                            aria-hidden
                            className="mt-1 h-8 w-0.5 shrink-0 bg-hairline"
                          />
                          <div className="min-w-0">
                            <p className="title-md truncate">{slot.subject}</p>
                            <p className="caption numeric mt-0.5">
                              {slot.start_time.slice(0, 5)}–
                              {slot.end_time.slice(0, 5)}
                              {slot.location && ` · ${slot.location}`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => void remove(slot.id)}
                          className="btn-icon size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`Delete ${slot.subject}`}
                        >
                          ✕
                        </button>
                      </li>
                    ))}

                    {dayTasks.length > 0 && (
                      <li className="px-4 py-3">
                        <p className="label-upper mb-2 text-muted">Todo</p>
                        <ul className="flex flex-col gap-2">
                          {dayTasks.map((task) => (
                            <li
                              key={task.id}
                              className={`flex items-start gap-3 border-l-2 border-warning pl-3 ${
                                task.done ? "opacity-55" : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <p
                                  className={`title-md truncate ${
                                    task.done
                                      ? "text-muted line-through"
                                      : ""
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`chip ${PRIORITY_STYLE[task.priority]}`}
                                  >
                                    {task.priority}
                                  </span>
                                  <span className="caption numeric">
                                    Due {task.due_date}
                                    {task.start_time &&
                                      task.end_time &&
                                      ` · ${task.start_time.slice(0, 5)}–${task.end_time.slice(0, 5)}`}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}