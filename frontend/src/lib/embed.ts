/** Convert a Spotify share link into its /embed/ equivalent. */
export function toSpotifyEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("spotify.com")) return null;
    if (parsed.pathname.startsWith("/embed/")) return parsed.toString();
    return `https://open.spotify.com/embed${parsed.pathname}`;
  } catch {
    return null;
  }
}

/** Convert a YouTube link into its /embed/ equivalent. Returns null for other hosts. */
export function toVideoEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/embed/")) return parsed.toString();
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string };

/**
 * Resolve any demo video link into something renderable: a YouTube iframe, or a
 * direct file (.mp4/.webm/.ogg — e.g. uploaded to Supabase Storage) played with
 * a native <video> element.
 */
export function resolveVideo(url: string): VideoSource | null {
  const embed = toVideoEmbed(url);
  if (embed) return { kind: "embed", src: embed };

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return { kind: "file", src: url };
  }
  return null;
}


