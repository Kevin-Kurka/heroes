import type { Metadata } from 'next';

/**
 * /review/card — a print-ready table-tent / receipt card. Big QR code → /review
 * (which one-taps into the Google "write a review" composer). Staff print these,
 * put them on tables and with the check, and review volume climbs — the #1 lever
 * for local + AI-assistant ranking. Utility page: noindex, print-optimized,
 * self-contained (no nav/chrome on print).
 */
export const metadata: Metadata = {
  title: 'Review Card — Print & Place on Tables',
  robots: { index: false, follow: false },
  alternates: { canonical: '/review/card' },
};

export const dynamic = 'force-static';

export default function ReviewCardPage() {
  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col items-center justify-center gap-6 p-8 print:p-0">
      {/* Hide site nav/chrome when printing; one card per page. */}
      <style>{`@media print {
        nav, header, footer, [data-bottom-nav], .md\\:block, .md\\:hidden { display: none !important; }
        body { background: #fff !important; }
        @page { margin: 0.4in; }
      }`}</style>

      <p className="text-sm text-gray-500 print:hidden">
        Press ⌘P / Ctrl+P to print, then cut out and place on tables or with the check.
      </p>

      <article className="w-full max-w-md rounded-3xl border-[6px] border-[#bf0a30] px-8 py-10 text-center shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0a3161]">
          American Heroes &amp; Brew
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight text-black">
          Loved it? Leave us a review! 🍻
        </h1>
        <div className="my-3 text-3xl tracking-widest text-[#bf0a30]">★★★★★</div>

        {/* QR → americanheroesandbrew.com/review → Google review composer */}
        <img
          src="/review-qr.svg"
          alt="Scan to leave a Google review for American Heroes & Brew"
          className="mx-auto my-5 h-60 w-60"
        />

        <p className="text-xl font-bold text-black">Scan to leave a 5★ Google review</p>
        <p className="mt-1 text-gray-600">Takes 10 seconds — it helps more fans find us.</p>
        <p className="mt-5 text-lg font-semibold text-[#0a3161]">
          americanheroesandbrew.com/review
        </p>
      </article>
    </div>
  );
}
