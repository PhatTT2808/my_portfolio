export type Profile = {
  headline: string;
  subheadline: string | null;
  bio: string | null;
  spotify_embed_url: string | null;
  email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
};

export type Project = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  tags: string[];
  repo_url: string | null;
  live_url: string | null;
  sort_order: number;
};

export type Vocab = {
  id: string;
  word: string;
  meaning: string;
  example: string | null;
  pronunciation: string | null;
  learned: boolean;
  created_at: string;
};

export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  priority: Priority;
  done: boolean;
  created_at: string;
};

export type ScheduleSlot = {
  id: string;
  subject: string;
  weekday: number;
  start_time: string;
  end_time: string;
  location: string | null;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  spent_on: string;
  created_at: string;
};
