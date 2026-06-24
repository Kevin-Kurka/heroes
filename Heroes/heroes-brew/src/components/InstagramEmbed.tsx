/**
 * Lightweight Instagram post/reel embed — renders the official embed iframe for a
 * post permalink (https://www.instagram.com/p/<code>/ or /reel/<code>/). No
 * external script needed; `/embed` is a self-contained iframe. Used to show the
 * Instagram post that nominated/announced the Hero of the Month.
 */

/** Extract the /p/<code> or /reel/<code> path from an Instagram permalink. */
function toEmbedSrc(url: string): string | null {
  const m = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  return `https://www.instagram.com/${m[1]}/${m[2]}/embed`;
}

interface Props {
  /** Instagram post/reel permalink. */
  url: string;
  /** Optional caption/label under the embed. */
  caption?: string;
  className?: string;
}

export default function InstagramEmbed({ url, caption, className }: Props) {
  const src = toEmbedSrc(url);
  if (!src) {
    // Fallback: a plain link if the URL isn't a recognizable IG permalink.
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline">
        View the nomination on Instagram
      </a>
    );
  }
  return (
    <div className={className}>
      <iframe
        src={src}
        title="Instagram nomination post"
        loading="lazy"
        scrolling="no"
        className="mx-auto w-full max-w-[400px] rounded-lg border border-border bg-card"
        style={{ height: 540 }}
        allowFullScreen
      />
      {caption && <p className="mt-2 text-center text-xs text-muted">{caption}</p>}
    </div>
  );
}
