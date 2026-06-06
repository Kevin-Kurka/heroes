import { PartyPopper } from 'lucide-react';

/**
 * Visual "Let's Go" affordance on each event card. Presentational only — the
 * whole card is the click target and opens the share dialog (see EventCard) — so
 * this renders a span, not a button, to avoid a nested interactive element.
 */
export default function LetsGoChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent">
      <PartyPopper size={12} />
      Let&apos;s Go
    </span>
  );
}
