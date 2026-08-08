import Link from "next/link";

import { api } from "@/lib/api";
import { CV } from "@/lib/cv";
import { resolveVideo, toSpotifyEmbed } from "@/lib/embed";
import type { Profile, Project } from "@/lib/types";

/** Shown until you configure Supabase — swap it in the `profile` table. */
const DEFAULT_PLAYLIST =
  "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M";

const FALLBACK_PROFILE: Profile = {
  headline: CV.name,
  subheadline: CV.role,
  bio: CV.objective,
  spotify_embed_url: DEFAULT_PLAYLIST,

  email: CV.email,
  github_url: CV.github,
  linkedin_url: CV.linkedin,
};

async function loadProfile(): Promise<Profile> {
  try {
    return await api<Profile>("/profile", { revalidate: 60 });
  } catch {
    return FALLBACK_PROFILE;
  }
}

async function loadProjects(): Promise<Project[]> {
  try {
    return await api<Project[]>("/projects", { revalidate: 60 });
  } catch {
    return [];
  }
}

const PRIVATE_LINKS = [
  {
    href: "/vocabulary",
    title: "Vocabulary",
    description: "English words with meanings, examples and progress.",
  },
  {
    href: "/planner",
    title: "Planner",
    description: "Todo list, weekly timetable and daily expense tracking.",
  },
];

const NAV_ITEMS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#workspace", label: "Workspace" },
];

/** Section header: index number, hairline rule, uppercase display title. */
function SectionHead({
  index,
  eyebrow,
  title,
  lead,
}: {
  index: string;
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mb-12 grid gap-6 border-b border-hairline-strong pb-8 md:grid-cols-[10rem_1fr] md:gap-10">
      <div className="flex items-baseline gap-4">
        <span className="index-num">{index}</span>
        <span className="label-upper text-muted">{eyebrow}</span>
      </div>
      <div className="max-w-2xl">
        <h2 className="display-lg">{title}</h2>
        {lead && <p className="body-md mt-4">{lead}</p>}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [profile, projects] = await Promise.all([loadProfile(), loadProjects()]);
  const spotifyEmbed = profile.spotify_embed_url
    ? toSpotifyEmbed(profile.spotify_embed_url)
    : null;

  const email = profile.email ?? CV.email;
  const github = profile.github_url ?? CV.github;
  const linkedin = profile.linkedin_url ?? CV.linkedin;

  const skillCount = CV.skills.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  const specs = [
    { value: String(CV.experience.length), label: "ML projects" },
    { value: String(skillCount), label: "Tools & frameworks" },
    { value: String(CV.certifications.length), label: "Certifications" },
    { value: CV.education.gpa.split(" ")[0], label: "GPA / 4.0" },
  ];

  return (
    <div>
      {/* ---------------------------------------------------------------
          Top nav — 64px, flat black, M stripe underneath
          --------------------------------------------------------------- */}
      <header className="sticky top-0 z-50">
        <div className="glass">
          <div className="shell flex h-16 items-center justify-between gap-8">
            <Link href="/" className="flex shrink-0 items-baseline gap-3">
              <span className="display-sm leading-none">{CV.name}</span>
              <span className="m-stripe-thin hidden w-8 sm:block" />
            </Link>

            <nav className="hidden items-center gap-9 md:flex">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </a>
              ))}
            </nav>

            <a href={`mailto:${email}`} className="btn h-10 shrink-0 px-5">
              Contact
            </a>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------
          Hero band
          --------------------------------------------------------------- */}
      <section className="border-b border-hairline-strong">
        <div className="shell pt-16 pb-0 md:pt-24">
          <div className="grid gap-10 md:grid-cols-[10rem_1fr] md:gap-10">
            <div className="flex flex-col gap-4">
              <span className="index-num">00</span>
              <span className="m-stripe w-16" />
            </div>

            <div>
              <p className="animate-fade label-upper mb-6 text-body">
                {profile.subheadline}
              </p>

              <h1 className="animate-rise display-xl max-w-4xl">
                {profile.headline}
              </h1>

              {profile.bio && (
                <p className="animate-rise delay-1 body-md mt-8 max-w-2xl">
                  {profile.bio}
                </p>
              )}

              <div className="animate-rise delay-2 mt-10 flex flex-wrap items-center gap-3">
                <a href={github} className="btn" target="_blank" rel="noreferrer">
                  GitHub <span aria-hidden>→</span>
                </a>
                <a
                  href={linkedin}
                  className="btn-ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn <span aria-hidden>→</span>
                </a>
              </div>

              <p className="animate-rise delay-3 caption mt-6">
                {CV.location} — {CV.phone} — {email}
              </p>
            </div>
          </div>
        </div>

        {/* Spec table — 4-up desktop, collapses to 2-up */}
        <dl className="shell mt-14 grid grid-cols-2 border-t border-hairline-strong md:mt-20 md:grid-cols-4">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="border-r border-b border-hairline-strong bg-surface-soft px-5 py-7 last:border-r-0 md:px-6 md:py-9"
            >
              <dd className="display-md numeric">{spec.value}</dd>
              <dt className="label-upper mt-3 text-muted">{spec.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------------------------------------------------------
          About — objective, education, certifications, languages
          --------------------------------------------------------------- */}
      <section id="about">
        <div className="shell section-pad">
          <SectionHead
            index="01"
            eyebrow="Profile"
            title="Career objective"
            lead={CV.objective}
          />

          <div className="stagger grid divide-y divide-hairline-strong border border-hairline-strong md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="p-6 md:p-8">
              <p className="label-upper mb-6 text-muted">Education</p>
              <h3 className="title-lg mb-2">{CV.education.degree}</h3>
              <p className="body-sm">{CV.education.school}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="chip numeric">{CV.education.period}</span>
                <span className="chip numeric">GPA {CV.education.gpa}</span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="label-upper mb-6 text-muted">Certifications</p>
              <ul className="flex flex-col divide-y divide-hairline-strong">
                {CV.certifications.map((cert) => (
                  <li key={cert.name} className="py-3 first:pt-0 last:pb-0">
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block"
                    >
                      <p className="title-md group-hover:underline">
                        {cert.name}{" "}
                        <span aria-hidden className="text-muted">
                          →
                        </span>
                      </p>
                      <p className="caption mt-1">{cert.issuer}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 md:p-8">
              <p className="label-upper mb-6 text-muted">Languages</p>
              <ul className="flex flex-col divide-y divide-hairline-strong">
                {CV.languages.map((language) => (
                  <li
                    key={language.name}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="title-md">{language.name}</span>
                    <span className="caption">{language.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Work — numbered editorial list, not a card grid
          --------------------------------------------------------------- */}
      <section id="work" className="hairline-top">
        <div className="shell section-pad">
          <SectionHead
            index="02"
            eyebrow="Track record"
            title="Selected work"
            lead="Applied machine learning — from dataset construction through model training to deployment."
          />

          <ol className="flex flex-col">
            {CV.experience.map((item, position) => {
              const video = item.demo ? resolveVideo(item.demo) : null;
              return (
                <li
                  key={item.title}
                  className="grid gap-6 border-b border-hairline-strong py-10 md:grid-cols-[10rem_1fr] md:gap-10 md:py-14"
                >
                  <div className="flex flex-row items-baseline gap-4 md:flex-col md:gap-3">
                    <span className="index-num">
                      {String(position + 1).padStart(2, "0")}
                    </span>
                    <span className="caption numeric">{item.period}</span>
                  </div>

                  <article>
                    <h3 className="display-sm mb-2">{item.title}</h3>
                    <p className="caption mb-6">{item.context}</p>

                    <ul className="mb-7 flex max-w-3xl flex-col gap-3">
                      {item.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-4">
                          <span
                            aria-hidden
                            className="mt-2.5 h-px w-4 shrink-0 bg-hairline"
                          />
                          <p className="body-sm">{highlight}</p>
                        </li>
                      ))}
                    </ul>

                    <ul className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <li key={tag} className="chip">
                          {tag}
                        </li>
                      ))}
                    </ul>

                    {video && (
                      <div className="mt-8 max-w-3xl">
                        <p className="label-upper mb-3 text-muted">Demo</p>
                        <div className="aspect-video border border-hairline-strong bg-surface-soft">
                          {video.kind === "embed" ? (
                            <iframe
                              src={video.src}
                              title={`${item.title} demo`}
                              loading="lazy"
                              allowFullScreen
                              className="h-full w-full border-0"
                            />
                          ) : (
                            <video
                              src={video.src}
                              controls
                              preload="metadata"
                              playsInline
                              className="h-full w-full"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {item.repo && (
                      <a
                        href={item.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="label-upper mt-8 inline-block underline decoration-hairline underline-offset-8 hover:decoration-ink"
                      >
                        View repository <span aria-hidden>→</span>
                      </a>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Skills
          --------------------------------------------------------------- */}
      <section id="skills" className="hairline-top">
        <div className="shell section-pad">
          <SectionHead
            index="03"
            eyebrow="Toolbox"
            title="Skills"
            lead="The frameworks, languages and tools I reach for day to day."
          />

          <div className="stagger grid divide-y divide-hairline-strong border border-hairline-strong md:grid-cols-3 md:divide-x md:divide-y-0">
            {CV.skills.map((group) => (
              <div key={group.group} className="p-6 md:p-8">
                <span className="m-stripe-thin mb-6 block w-10" />
                <h3 className="display-sm mb-5">{group.group}</h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Projects (from Supabase)
          --------------------------------------------------------------- */}
      {projects.length > 0 && (
        <section id="projects" className="hairline-top">
          <div className="shell section-pad">
            <SectionHead
              index="04"
              eyebrow="Shipped"
              title="Featured projects"
              lead="Things I've designed, built and shipped — with demos where available."
            />

            <div className="stagger grid border-t border-l border-hairline-strong md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const video = project.video_url
                  ? resolveVideo(project.video_url)
                  : null;
                return (
                  <article
                    key={project.id}
                    className="flex flex-col border-r border-b border-hairline-strong p-6 md:p-8"
                  >
                    {video && (
                      <div className="mb-6 aspect-video border border-hairline-strong bg-surface-soft">
                        {video.kind === "embed" ? (
                          <iframe
                            src={video.src}
                            title={project.title}
                            loading="lazy"
                            allowFullScreen
                            className="h-full w-full border-0"
                          />
                        ) : (
                          <video
                            src={video.src}
                            controls
                            preload="metadata"
                            playsInline
                            className="h-full w-full"
                          />
                        )}
                      </div>
                    )}

                    <h3 className="display-sm mb-3">{project.title}</h3>

                    {project.description && (
                      <p className="body-sm mb-5">{project.description}</p>
                    )}

                    {project.tags.length > 0 && (
                      <ul className="mb-6 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <li key={tag} className="chip">
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto flex items-center gap-6 border-t border-hairline-strong pt-5">
                      {project.repo_url && (
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="label-upper text-body hover:text-ink"
                        >
                          Code <span aria-hidden>→</span>
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="label-upper hover:underline"
                        >
                          Live demo <span aria-hidden>→</span>
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------
          Private workspace
          --------------------------------------------------------------- */}
      <section id="workspace" className="hairline-top">
        <div className="shell section-pad">
          <SectionHead
            index="05"
            eyebrow="Password protected"
            title="Private workspace"
            lead="Personal tools I use daily. They sit behind a password — look, don't touch."
          />

          <div className="stagger grid border-t border-l border-hairline-strong md:grid-cols-2">
            {PRIVATE_LINKS.map((link, position) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col justify-between gap-10 border-r border-b border-hairline-strong p-6 transition-colors hover:bg-surface-card md:p-8"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <span className="index-num">
                      {String(position + 1).padStart(2, "0")}
                    </span>
                    <h3 className="display-md mt-4 mb-3">{link.title}</h3>
                    <p className="body-sm max-w-sm">{link.description}</p>
                  </div>
                  <span className="chip shrink-0">Locked</span>
                </div>

                <span className="label-upper text-body group-hover:text-ink">
                  Open <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Now playing
          --------------------------------------------------------------- */}
      {spotifyEmbed && (
        <section className="hairline-top">
          <div className="shell py-14 md:py-16">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div className="flex items-baseline gap-4">
                <span className="index-num">06</span>
                <h2 className="display-sm">Now playing</h2>
              </div>
              <span className="chip">
                <span className="size-1.5 animate-pulse-dot bg-success" />
                Spotify
              </span>
            </div>

            <div className="border border-hairline-strong">
              <iframe
                src={spotifyEmbed}
                title="Spotify player"
                width="100%"
                height="352"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="block border-0"
              />
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------
          Closing CTA band
          --------------------------------------------------------------- */}
      <section className="hairline-top bg-surface-soft">
        <div className="shell py-20 text-center md:py-24">
          <span className="m-stripe mx-auto mb-8 block w-20" />
          <h2 className="display-lg mx-auto max-w-2xl">
            Looking for an AI engineering intern
          </h2>
          <p className="body-md mx-auto mt-5 max-w-xl">
            If that sounds like your team, the fastest route is email.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${email}`} className="btn">
              {email}
            </a>
            <a href={`tel:${CV.phone}`} className="btn-ghost numeric">
              {CV.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Footer
          --------------------------------------------------------------- */}
      <footer className="hairline-top">
        <div className="shell flex flex-col items-start justify-between gap-5 py-10 sm:flex-row sm:items-center">
          <p className="caption">
            © {new Date().getFullYear()} {CV.name}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              className="label-upper text-muted hover:text-ink"
            >
              GitHub
            </a>
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              className="label-upper text-muted hover:text-ink"
            >
              LinkedIn
            </a>
            <a href="#about" className="label-upper text-muted hover:text-ink">
              Top <span aria-hidden>↑</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
