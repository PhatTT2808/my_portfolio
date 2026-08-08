"use client";

import { useCallback, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { Expense } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";

const CATEGORIES = ["food", "transport", "study", "bills", "fun", "other"];

/** Two-letter codes read as spec labels — no emoji in this system. */
const CATEGORY_CODE: Record<string, string> = {
  food: "FD",
  transport: "TR",
  study: "ST",
  bills: "BL",
  fun: "FN",
  other: "OT",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function ExpensesPanel() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "food",
    spent_on: today(),
  });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setExpenses(await api<Expense[]>("/expenses", { auth: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    }
  }, []);

  useLoad(load);

  const stats = useMemo(() => {
    const day = today();
    const month = day.slice(0, 7);
    const byCategory = new Map<string, number>();
    let todayTotal = 0;
    let monthTotal = 0;

    for (const expense of expenses) {
      if (expense.spent_on === day) todayTotal += expense.amount;
      if (expense.spent_on.startsWith(month)) {
        monthTotal += expense.amount;
        byCategory.set(
          expense.category,
          (byCategory.get(expense.category) ?? 0) + expense.amount,
        );
      }
    }
    return {
      todayTotal,
      monthTotal,
      byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [expenses]);

  async function addExpense(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await api("/expenses", {
        method: "POST",
        auth: true,
        body: {
          title: form.title.trim(),
          amount: Number(form.amount),
          category: form.category,
          spent_on: form.spent_on,
        },
      });
      setForm({ ...form, title: "", amount: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    }
  }

  async function remove(id: string) {
    await api(`/expenses/${id}`, { method: "DELETE", auth: true });
    await load();
  }

  const amountValid = Number(form.amount) > 0;
  const maxCategory = stats.byCategory[0]?.[1] ?? 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
      {/* Form + summary */}
      <aside className="flex flex-col gap-6">
        <section className="panel">
          <span className="m-stripe-thin mb-6 block w-10" />
          <h2 className="display-sm mb-2">Add expense</h2>
          <p className="body-sm mb-7">Track every đồng as it goes out.</p>

          <form onSubmit={addExpense} className="flex flex-col gap-4">
            <div>
              <label htmlFor="e-title" className="field-label">
                What did you buy?
              </label>
              <input
                id="e-title"
                className="input"
                placeholder="Lunch with friends"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="e-amount" className="field-label">
                Amount (VND)
              </label>
              <input
                id="e-amount"
                className="input numeric"
                type="number"
                min="0"
                step="1000"
                placeholder="50000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="e-category" className="field-label">
                  Category
                </label>
                <select
                  id="e-category"
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="e-date" className="field-label">
                  Date
                </label>
                <input
                  id="e-date"
                  className="input"
                  type="date"
                  value={form.spent_on}
                  onChange={(e) => setForm({ ...form, spent_on: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn w-full"
              disabled={!form.title.trim() || !amountValid}
            >
              Add expense
            </button>

            {error && (
              <p className="body-sm border-l-2 border-m-red pl-3 text-m-red">
                {error}
              </p>
            )}
          </form>
        </section>

        <div className="grid grid-cols-2">
          <div className="stat border-r-0">
            <p className="display-sm numeric">
              {currency.format(stats.todayTotal)}
            </p>
            <p className="label-upper mt-2 text-muted">Today</p>
          </div>
          <div className="stat">
            <p className="display-sm numeric">
              {currency.format(stats.monthTotal)}
            </p>
            <p className="label-upper mt-2 text-muted">This month</p>
          </div>
        </div>

        {stats.byCategory.length > 0 && (
          <section className="panel">
            <p className="label-upper mb-5 text-muted">By category · month</p>
            <ul className="flex flex-col gap-4">
              {stats.byCategory.map(([category, total]) => (
                <li key={category}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="label-upper text-body-strong">
                      {category}
                    </span>
                    <span className="numeric text-sm">
                      {currency.format(total)}
                    </span>
                  </div>
                  <div className="meter">
                    <div
                      className="meter-fill"
                      style={{
                        width: maxCategory
                          ? `${Math.round((total / maxCategory) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* History */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-hairline-strong pb-5">
          <h2 className="display-sm">History</h2>
          <span className="chip numeric">{expenses.length} records</span>
        </div>

        {expenses.length === 0 ? (
          <div className="border border-dashed border-hairline py-16 text-center">
            <p className="display-sm mb-2">No expenses yet</p>
            <p className="body-sm">Add your first entry to start tracking.</p>
          </div>
        ) : (
          <ul className="stagger flex flex-col border-t border-hairline-strong">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="group flex items-center justify-between gap-5 border-b border-hairline-strong py-4 transition-colors hover:bg-surface-card"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="index-num grid size-10 shrink-0 place-items-center border border-hairline">
                    {CATEGORY_CODE[expense.category] ?? "OT"}
                  </span>
                  <div className="min-w-0">
                    <p className="title-md truncate">{expense.title}</p>
                    <p className="caption numeric mt-0.5">
                      {expense.spent_on} · {expense.category}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className="numeric text-base">
                    {currency.format(expense.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void remove(expense.id)}
                    className="btn-icon size-7 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Delete ${expense.title}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
