import { MessageCircleQuestion, Info } from 'lucide-react';
import { FAQ } from '@/lib/faq';

/**
 * Server-rendered About + FAQ block for the homepage. Plain HTML (native
 * <details> accordion) so every word is in the initial markup — crawlable by
 * Google and readable by answer engines. The FAQ text mirrors the FAQPage
 * JSON-LD (both sourced from faq.ts) to satisfy Google's "visible content"
 * requirement for FAQ rich results.
 */
export default function AboutFaqSection() {
  return (
    <>
      {/* About / why-us — entity clarity + local landmarks for "near me" search */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Info size={20} className="text-accent" />
          <h2 className="text-2xl font-bold text-foreground">About American Heroes &amp; Brew</h2>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 text-foreground/85 leading-relaxed">
          <p>
            <strong className="text-foreground">American Heroes &amp; Brew</strong> is a
            family-friendly sports bar and restaurant in the heart of{' '}
            <strong className="text-foreground">Carlsbad Village</strong>, just minutes from
            Carlsbad State Beach in North County San Diego. You&apos;ll find us at 300 Carlsbad
            Village Drive, Suite 120 — steps from the Village shops and a short drive off the I-5.
          </p>
          <p>
            We serve an all-American menu — juicy burgers, signature wings, loaded fries,
            cheesesteaks and sandwiches, nachos, salads, and weekend breakfast — alongside a full
            bar and craft beer on tap. With <strong className="text-foreground">16 TVs</strong>{' '}
            showing every game from the NFL and NBA to college football and pay-per-view UFC,
            it&apos;s the go-to spot in Carlsbad to catch the game, grab lunch, or bring the family
            for the After School Special.
          </p>
        </div>
      </section>

      {/* FAQ — answer-engine fuel; native accordion keeps all answers in the HTML */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircleQuestion size={20} className="text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.question}
              className="group bg-card border border-border rounded-lg px-5 py-4 [&_summary]:cursor-pointer"
            >
              <summary className="flex items-center justify-between gap-3 font-semibold text-foreground list-none">
                {item.question}
                <span className="text-accent transition-transform group-open:rotate-45 text-xl leading-none">
                  +
                </span>
              </summary>
              <p className="mt-3 pt-3 border-t border-border/50 text-foreground/80 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
