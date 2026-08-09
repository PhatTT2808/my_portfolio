"use client";

import { useCallback, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { Expense, Wallet } from "@/lib/types";
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
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "food",
    type: "expense" as "expense" | "income",
    spent_on: today(),
  });
  const [balanceInput, setBalanceInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [expenseList, walletData] = await Promise.all([
        api<Expense[]>("/expenses", { auth: true }),
        api<Wallet>("/wallet", { auth: true }),
      ]);
      setExpenses(expenseList);
      setWallet(walletData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    }
  }, []);

  useLoad(load);

  const stats = useMemo(() => {
    const day = today();
    const month = day.slice(0, 7);
    const byCategory = new Map<string, number>();
    let todayExpense = 0;
    let todayIncome = 0;
    let monthExpense = 0;
    let monthIncome = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    for (const expense of expenses) {
      const amount = expense.amount;
      if (expense.type === "income") {
        totalIncome += amount;
        if (expense.spent_on === day) todayIncome += amount;
        if (expense.spent_on.startsWith(month)) monthIncome += amount;
      } else {
        totalExpense += amount;
        if (expense.spent_on === day) todayExpense += amount;
        if (expense.spent_on.startsWith(month)) {
          monthExpense += amount;
          byCategory.set(
            expense.category,
            (byCategory.get(expense.category) ?? 0) + amount,
          );
        }
      }
    }

    const initial = wallet?.initial_balance ?? 0;
    const balance = initial + totalIncome - totalExpense;

    return {
      todayExpense,
      todayIncome,
      monthExpense,
      monthIncome,
      totalIncome,
      totalExpense,
      balance,
      byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [expenses, wallet]);

  async function addEntry(event: React.FormEvent) {
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
          type: form.type,
          spent_on: form.spent_on,
        },
      });
      setForm({ ...form, title: "", amount: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add entry");
    }
  }

  async function saveBalance(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const value = Number(balanceInput);
    if (!Number.isFinite(value) || value < 0) {
      setError("Initial balance must be a non-negative number");
      return;
    }
    try {
      await api("/wallet", {
        method: "PATCH",
        auth: true,
        body: { initial_balance: value },
      });
      setBalanceInput("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save balance");
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
          <h2 className="display-sm mb-2">Add entry</h2>
          <p className="body-sm mb-7">Record money in or money out.</p>

          <form onSubmit={addEntry} className="flex flex-col gap-4">
            <div>
              <label htmlFor="e-title" className="field-label">
                What is it?
              </label>
              <input
                id="e-title"
                className="input"
                placeholder="Lunch with friends"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="e-type" className="field-label">
                  Type
                </label>
                <select
                  id="e-type"
                  className="input"
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as "expense" | "income",
                    })
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
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
              {form.type === "income" ? "Add income" : "Add expense"}
            </button>

            {error && (
              <p className="body-sm border-l-2 border-m-red pl-3 text-m-red">
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="panel">
          <p className="label-upper mb-4 text-muted">Initial balance</p>
          <form onSubmit={saveBalance} className="flex gap-3">
            <input
              className="input numeric"
              type="number"
              min="0"
              step="1000"
              placeholder={wallet ? String(wallet.initial_balance) : "0"}
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              aria-label="Initial balance"
            />
            <button type="submit" className="btn shrink-0" disabled={!balanceInput}>
              Save
            </button>
          </form>
          <p className="caption mt-3 text-muted">
            Starting money you already have. Balance = initial + income − expenses.
          </p>
        </section>

        <div className="grid grid-cols-2">
          <div className="stat border-r-0">
            <p className="display-sm numeric">{currency.format(stats.balance)}</p>
            <p className="label-upper mt-2 text-muted">Balance</p>
          </div>
          <div className="stat">
            <p className="display-sm numeric">
              {currency.format(stats.monthExpense)}
            </p>
            <p className="label-upper mt-2 text-muted">Spent · month</p>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="stat border-r-0">
            <p className="display-sm numeric">
              {currency.format(stats.monthIncome)}
            </p>
            <p className="label-upper mt-2 text-muted">Earned · month</p>
          </div>
          <div className="stat">
            <p className="display-sm numeric">
              {currency.format(stats.todayExpense)}
            </p>
            <p className="label-upper mt-2 text-muted">Today</p>
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
            <p className="display-sm mb-2">No entries yet</p>
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
                  <span
                    className={`index-num grid size-10 shrink-0 place-items-center border ${
                      expense.type === "income"
                        ? "border-success text-success"
                        : "border-hairline"
                    }`}
                  >
                    {expense.type === "income" ? "IN" : CATEGORY_CODE[expense.category] ?? "OT"}
                  </span>
                  <div className="min-w-0">
                    <p className="title-md truncate">{expense.title}</p>
                    <p className="caption numeric mt-0.5">
                      {expense.spent_on} · {expense.category} · {expense.type}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span
                    className={`numeric text-base ${
                      expense.type === "income"
                        ? "text-success"
                        : ""
                    }`}
                  >
                    {expense.type === "income" ? "+" : "−"}
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