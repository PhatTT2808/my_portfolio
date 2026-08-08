"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { Vocab } from "@/lib/types";

const EMPTY_FORM = { word: "", meaning: "", pronunciation: "", example: "" };

export default function VocabularyManager() {
  const [words, setWords] = useState<Vocab[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (term: string) => {
    try {
      const query = term ? `?search=${encodeURIComponent(term)}` : "";
      setWords(await api<Vocab[]>(`/vocabulary${query}`, { auth: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load words");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(search), 250);
    return () => clearTimeout(timer);
  }, [search, load]);

  async function addWord(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api<Vocab>("/vocabulary", {
        method: "POST",
        auth: true,
        body: {
          word: form.word.trim(),
          meaning: form.meaning.trim(),
          pronunciation: form.pronunciation.trim() || null,
          example: form.example.trim() || null,
        },
      });
      setForm(EMPTY_FORM);
      await load(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add word");
    } finally {
      setSaving(false);
    }
  }

  async function toggleLearned(word: Vocab) {
    await api(`/vocabulary/${word.id}`, {
      method: "PATCH",
      auth: true,
      body: { learned: !word.learned },
    });
    await load(search);
  }

  async function remove(id: string) {
    await api(`/vocabulary/${id}`, { method: "DELETE", auth: true });
    await load(search);
  }

  const learnedCount = words.filter((word) => word.learned).length;
  const progress = words.length ? Math.round((learnedCount / words.length) * 100) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
      {/* -------------------------------------------------------------
          Add form + progress
          ------------------------------------------------------------- */}
      <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
        <section className="panel">
          <span className="m-stripe-thin mb-6 block w-10" />
          <h2 className="display-sm mb-2">Add a word</h2>
          <p className="body-sm mb-7">Build your vocabulary one entry at a time.</p>


          <form onSubmit={addWord} className="flex flex-col gap-4">
            <div>
              <label htmlFor="v-word" className="field-label">
                Word
              </label>
              <input
                id="v-word"
                className="input"
                placeholder="serendipity"
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="v-meaning" className="field-label">
                Meaning
              </label>
              <input
                id="v-meaning"
                className="input"
                placeholder="a happy accident"
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="v-pron" className="field-label">
                Pronunciation · optional
              </label>
              <input
                id="v-pron"
                className="input"
                placeholder="/ˌserənˈdipədē/"
                value={form.pronunciation}
                onChange={(e) =>
                  setForm({ ...form, pronunciation: e.target.value })
                }
              />
            </div>

            <div>
              <label htmlFor="v-example" className="field-label">
                Example · optional
              </label>
              <textarea
                id="v-example"
                className="input h-24 py-2.5"
                placeholder="Meeting her was pure serendipity."
                value={form.example}
                onChange={(e) => setForm({ ...form, example: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn w-full"
              disabled={saving || !form.word.trim() || !form.meaning.trim()}
            >
              {saving ? "Saving…" : "Add word"}
            </button>

            {error && (
              <p className="body-sm border-l-2 border-m-red pl-3 text-m-red">
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="stat">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="display-md numeric">
                {learnedCount}
                <span className="text-muted">/{words.length}</span>
              </p>
              <p className="label-upper mt-2 text-muted">Learned</p>
            </div>
            <span className="numeric display-sm">{progress}%</span>
          </div>
          <div className="meter">
            <div className="meter-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>

      </aside>

      {/* -------------------------------------------------------------
          List
          ------------------------------------------------------------- */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-hairline-strong pb-5">
          <div>
            <h2 className="display-sm">Your words</h2>
            <p className="caption mt-2">
              {words.length} {words.length === 1 ? "entry" : "entries"}
              {search && " matching your search"}
            </p>
          </div>

          <input
            className="input w-full sm:w-72"
            placeholder="Search words…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {words.length === 0 ? (
          <div className="border border-dashed border-hairline py-16 text-center">
            <p className="display-sm mb-2">
              {search ? "No matches" : "Nothing here yet"}
            </p>
            <p className="body-sm">
              {search
                ? "Try a different search term."
                : "Add your first word using the form."}
            </p>
          </div>
        ) : (
          <ul className="stagger flex flex-col border-t border-hairline-strong">
            {words.map((word) => (
              <li
                key={word.id}
                className="group flex items-start justify-between gap-5 border-b border-hairline-strong py-5 transition-colors hover:bg-surface-card"
              >
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-baseline gap-3">
                    <h3 className="display-sm">{word.word}</h3>
                    {word.pronunciation && (
                      <span className="caption font-mono">
                        {word.pronunciation}
                      </span>
                    )}
                    {word.learned && (
                      <span className="chip border-success text-success">
                        Learned
                      </span>
                    )}
                  </div>

                  <p className="body-md text-body-strong">{word.meaning}</p>

                  {word.example && (
                    <p className="body-sm mt-3 border-l border-hairline pl-4">
                      {word.example}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleLearned(word)}
                    className="btn-ghost h-9 px-3 text-[11px]"
                  >
                    {word.learned ? "Undo" : "Mark learned"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(word.id)}
                    className="btn-icon"
                    aria-label={`Delete ${word.word}`}
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
