'use client';

import { Star, ChevronRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface Props {
  /** Where this CTA is rendered, for GA attribution (e.g. 'home', 'location'). */
  source?: string;
  className?: string;
}

/**
 * One-tap prompt to leave a Google review. Review volume is the strongest local
 * ranking signal for "best sports bar near me" in both Google and AI answers, so
 * surfacing the existing /review short link (which deep-links straight into the
 * Google review box) turns happy site visitors into reviewers. Opens in a new
 * tab so visitors keep their place on the site.
 */
export default function ReviewCTA({ source = 'home', className = '' }: Props) {
  return (
    <a
      href="/review"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('review_click', { source })}
      className={`group flex items-center gap-4 bg-card/70 backdrop-blur-md border border-accent/30 rounded-md p-4 hover:border-accent/60 hover:bg-card-hover transition-all ${className}`}
    >
      <div className="p-2 bg-accent/10 rounded-lg shrink-0">
        <Star size={20} className="text-accent fill-accent" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
          Enjoyed the game here?
        </h3>
        <p className="text-muted text-sm mt-0.5">
          Drop us a Google review — 10 seconds, and it helps other fans find us.
        </p>
      </div>
      <ChevronRight size={16} className="text-muted ml-auto shrink-0 group-hover:text-accent transition-colors" />
    </a>
  );
}
