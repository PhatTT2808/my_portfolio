"use client";

import { useState } from "react";

import ExpensesPanel from "./ExpensesPanel";
import SchedulePanel from "./SchedulePanel";
import TasksPanel from "./TasksPanel";

const TABS = [
  { id: "tasks", label: "Todo", Panel: TasksPanel },
  { id: "schedule", label: "Timetable", Panel: SchedulePanel },
  { id: "expenses", label: "Expenses", Panel: ExpensesPanel },
] as const;

export default function PlannerWorkspace() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("tasks");
  const ActivePanel = TABS.find((tab) => tab.id === active)!.Panel;

  return (
    <div>
      <div className="mb-10 max-w-2xl">
        <span className="m-stripe mb-6 block w-14" />
        <h1 className="display-lg mb-3">Planner</h1>
        <p className="body-md">
          Tasks, weekly timetable and spending — all in one place.
        </p>
      </div>

      <nav
        aria-label="Planner sections"
        className="mb-10 flex gap-8 border-b border-hairline-strong"
      >
        {TABS.map((tab, position) => (
          <button
            key={tab.id}
            type="button"
            aria-current={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`tab ${active === tab.id ? "tab-active" : ""}`}
          >
            <span aria-hidden className="index-num">
              {String(position + 1).padStart(2, "0")}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div key={active} className="animate-fade">
        <ActivePanel />
      </div>
    </div>
  );
}
