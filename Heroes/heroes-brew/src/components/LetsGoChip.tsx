import { PartyPopper, Check } from 'lucide-react';

/**
 * Visual "Let's Go" affordance shown on each event card. It's presentational
 * only — the whole card is the click target (see useEventShare in EventCard) —
 * so this renders a span, not a button, to avoid a nested interactive element.
 */
export default function LetsGoChip({ copied = false }: { copied?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent">
      {copied ? <Check size={12} /> : <PartyPopper size={12} />}
      {copied ? 'Copied' : "Let's Go"}
    </span>
  );
}
