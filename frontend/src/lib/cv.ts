/**
 * Résumé content. Static on purpose — it changes rarely and should render
 * even before Supabase is configured. The `profile` / `projects` tables in
 * Supabase still take priority when they return data.
 */

export type ExperienceItem = {
  title: string;
  context: string;
  period: string;
  highlights: string[];
  tags: string[];
  /** GitHub URL — renders a "View repository" link. */
  repo?: string;
  /**
   * YouTube link OR a direct video file (.mp4/.webm/.ogg). Use a Supabase
   * Storage public URL, or drop the file in `frontend/public/demos/` and
   * reference it as `/demos/name.mp4`. Renders a player under the entry.
   */
  demo?: string;
};

export const EXPERIENCE: ExperienceItem[] = [
  {
    title: "English Spelling (Typo) Correction System — BART Seq2Seq",
    context: "Personal Project · FPT University",
    period: "09/2025 – 10/2025",
    highlights: [
      "Built an AI text corrector that automatically identifies and fixes character-level spelling errors in English sentences.",
      "Fine-tuned facebook/BART-base on a synthetic dataset of 183,653 noisy text pairs generated from a 30-book corpus, reaching a 75.4% F1-score.",
      "Deployed the model as a Gradio web app.",
    ],
    tags: ["PyTorch", "BART", "NLP", "Gradio", "Hugging Face"],
    // repo: "https://github.com/PhatTT2808/ten-repo",
    // demo: "/demos/spelling-correction.mp4",
  },
  {
    title: "Vietnamese Drug Information Search Engine",
    context: "FPT University",
    period: "10/2025 – 11/2025",
    highlights: [
      "Developed the core text processing and indexing module for a search engine covering 6,450 Vietnamese pharmaceutical products.",
      "Processed Vietnamese text with underthesea and built an inverted index over 48,063 unique tokens, recording term frequency and position.",
      "Enabled a TF-IDF ranking model that achieved 0.55 mAP.",
    ],
    tags: ["Python", "underthesea", "TF-IDF", "Information Retrieval"],
  },
  {
    title: "Real-time Hand Gesture & Sign Language Recognition",
    context: "FPT University",
    period: "09/2025 – 10/2025",
    highlights: [
      "Led data processing: collected and merged LSA64 with custom recordings into a 30-label dataset.",
      "Applied augmentation (playback speed, frame trimming) to produce 3,000 training samples and used MediaPipe to extract 126-D keypoint vectors.",
      "Trained a 4-layer, 8-head Transformer encoder to classify gesture sequences, outperforming traditional LSTMs on spatio-temporal data with 84.8% test accuracy after 40 epochs.",
    ],
    tags: ["Transformer", "MediaPipe", "OpenCV", "TensorFlow"],
  },
];

export const CV = {

  name: "Tran Tan Phat",
  role: "AI Engineer Intern · Data Scientist Intern",
  location: "Ho Chi Minh City, Vietnam",
  phone: "0944876812",
  email: "phat12340987@gmail.com",
  github: "https://github.com/PhatTT2808",
  linkedin: "https://www.linkedin.com/in/phat-tran-tan-22a568351",

  objective:
    "A third-year AI student at FPT University with a foundation in Python, ML/DL, and hands-on project experience. Eager to secure an AI Engineer or Data Scientist internship to tackle real-world challenges and contribute to developing impactful, application-oriented AI systems.",

  education: {
    degree: "Bachelor of Artificial Intelligence",
    school: "FPT University, Ho Chi Minh City",
    period: "09/2023 – Present",
    gpa: "3.0 / 4.0",
  },

  experience: EXPERIENCE,

  skills: [

    {
      group: "AI & Machine Learning",
      items: [
        "Machine Learning",
        "Deep Learning",
        "NLP / Text Mining",
        "TensorFlow",
        "PyTorch",
        "scikit-learn",
        "OpenCV",
      ],
    },
    {
      group: "Programming & Data Tools",
      items: [
        "Python",
        "SQL",
        "Git / GitHub",
        "NumPy",
        "Pandas",
        "Matplotlib",
        "Seaborn",
        "Power BI",
        "Jupyter",
        "Google Colab",
        "VS Code",
      ],
    },
    {
      group: "Soft Skills",
      items: ["Teamwork", "Problem-Solving"],
    },
  ],

  certifications: [
    {
      name: "Deep Learning Specialization",
      issuer: "DeepLearning.AI",
      url: "https://coursera.org/share/8abf7f57d4a545f975cb7c34ab94ef93",
    },
    {
      name: "Data Science Fundamentals with Python and SQL",
      issuer: "IBM",
      url: "https://coursera.org/share/82a80d82c64a4675cd069e1465762f86",
    },
  ],

  languages: [
    { name: "Vietnamese", level: "Native" },
    { name: "English", level: "Intermediate" },
  ],
} as const;
