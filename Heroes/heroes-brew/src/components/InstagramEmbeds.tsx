'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface Props {
  permalinks: string[];
}

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/**
 * Renders public Instagram posts via Instagram's official embed (embed.js).
 * Requires only the post permalinks — no API token, Facebook, or login.
 * Used as the no-credential fallback when a live feed isn't configured.
 */
export default function InstagramEmbeds({ permalinks }: Props) {
  // Re-process embeds whenever the list changes (and after the script loads).
  useEffect(() => {
    window.instgrm?.Embeds?.process();
  }, [permalinks]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [&_.instagram-media]:!min-w-0">
        {permalinks.map((url) => (
          <blockquote
            key={url}
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{ margin: 0, width: '100%', minWidth: 0, borderRadius: 8 }}
          />
        ))}
      </div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onReady={() => window.instgrm?.Embeds?.process()}
      />
    </>
  );
}
