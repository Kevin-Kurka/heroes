/** From classified rows, return exactly one row per slug: the highest quality
 *  (missing quality => 0), ties broken deterministically by path ascending.
 *  This is the dedup/merge step — many photos of one subject collapse to the best. */
export function selectBestPerSlug(rows) {
  const best = new Map();
  for (const r of rows) {
    const q = typeof r.quality === 'number' ? r.quality : 0;
    const cur = best.get(r.slug);
    if (!cur) { best.set(r.slug, r); continue; }
    const cq = typeof cur.quality === 'number' ? cur.quality : 0;
    if (q > cq || (q === cq && String(r.path) < String(cur.path))) best.set(r.slug, r);
  }
  return [...best.values()];
}
