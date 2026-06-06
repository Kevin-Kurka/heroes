'use client';

import { useState } from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import ReviewDialog from '@/components/ReviewDialog';

interface Props {
  /** Where this CTA is rendered, for GA attribution (e.g. 'home', 'location'). */
  source?: string;
  className?: string;
}

/**
 * Opens the review composer (stars default to 5, one-tap prompts, optional photo)
 * and hands off to Google / Yelp / Facebook / the share sheet. Review volume is
 * the strongest local-ranking signal for "best sports bar near me", so the goal
 * is to make leaving a genuine, glowing review effortless.
 */
export default function ReviewCTA({ source = 'home', className = '' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackEvent('open_review_dialog', { source });
          setOpen(true);
        }}
        className={`group flex w-full items-center gap-4 text-left bg-card/70 backdrop-blur-md border border-accent/30 rounded-md p-4 hover:border-accent/60 hover:bg-card-hover transition-all ${className}`}
      >
        <div className="p-2 bg-accent/10 rounded-lg shrink-0">
          <Star size={20} className="text-accent fill-accent" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
            Enjoyed the game here?
          </h3>
          <p className="text-muted text-sm mt-0.5">
            Leave a review — 10 seconds, and it helps other fans find us.
          </p>
        </div>
        <ChevronRight size={16} className="text-muted ml-auto shrink-0 group-hover:text-accent transition-colors" />
      </button>
      {open && <ReviewDialog onClose={() => setOpen(false)} />}
    </>
  );
}
