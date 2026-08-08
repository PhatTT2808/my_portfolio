"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api, clearToken, getToken, setToken } from "@/lib/api";

type Status = "checking" | "locked" | "unlocked";

export default function PasswordGate({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const check = getToken()
      ? api("/auth/me", { auth: true }).then(() => true)
      : Promise.resolve(false);

    check
      .catch(() => false)
      .then((valid) => {
        if (active) setStatus(valid ? "unlocked" : "locked");
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = await api<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: { password },
      });
      setToken(data.access_token);
      setPassword("");
      setStatus("unlocked");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5">
        <span className="m-stripe w-16 animate-pulse-dot" />
        <p className="label-upper text-muted">Verifying session</p>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-16">
        <div className="animate-rise w-full max-w-md">
          <div className="border border-hairline-strong bg-surface-card p-7 md:p-9">
            <span className="m-stripe mb-8 block w-14" />

            <p className="label-upper mb-3 text-muted">Restricted area</p>
            <h1 className="display-md mb-3">{title}</h1>
            <p className="body-sm mb-8">
              This section is private. Enter the password to continue.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="gate-password" className="field-label">
                  Password
                </label>
                <input
                  id="gate-password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  autoFocus
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error && (
                <p className="body-sm border-l-2 border-m-red pl-3 text-m-red">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn w-full"
                disabled={submitting || !password}
              >
                {submitting ? "Checking" : "Unlock"}
              </button>
            </form>
          </div>

          <Link
            href="/"
            className="label-upper mt-8 inline-block text-muted hover:text-ink"
          >
            <span aria-hidden>←</span> Back to portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50">
        <div className="glass">
          <div className="shell flex h-16 items-center justify-between gap-6">
            <div className="flex min-w-0 items-baseline gap-3">
              <Link
                href="/"
                className="label-upper shrink-0 text-muted hover:text-ink"
              >
                <span aria-hidden>←</span> Home
              </Link>
              <span aria-hidden className="text-hairline">
                /
              </span>
              <span className="display-sm truncate leading-none">{title}</span>
            </div>

            <button
              type="button"
              className="btn-ghost h-10 shrink-0 px-4"
              onClick={() => {
                clearToken();
                setStatus("locked");
              }}
            >
              Lock
            </button>
          </div>
        </div>
        <div className="m-stripe-thin" />
      </header>

      <main className="shell animate-fade py-10 md:py-14">{children}</main>
    </div>
  );
}
