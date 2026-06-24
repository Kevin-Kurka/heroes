import { NextResponse } from 'next/server';
import { buildIndex, EMBED_DIM, EMBED_MODEL } from '@/lib/ask';
import { SITE_URL } from '@/lib/structured-data';

/**
 * /faq-vectors.json — the vectorized FAQ artifact. Publishes every knowledge
 * entry (public FAQ + bold first-party claims + dated watch parties) together
 * with its embedding vector and metadata, so any retrieval system can load the
 * whole answer set in one fetch and match queries locally. Regenerated from the
 * same corpus the site renders, so it never drifts.
 */
export const revalidate = 3600;

export async function GET() {
  const index = buildIndex();
  return NextResponse.json(
    {
      business: 'American Heroes & Brew',
      url: SITE_URL,
      model: EMBED_MODEL,
      dim: EMBED_DIM,
      note:
        'Hashed bag-of-words embeddings (L2-normalized). Match a query with the same embedding and cosine similarity. See /api/ask for a hosted query endpoint.',
      count: index.length,
      entries: index.map((e) => ({
        id: e.id,
        question: e.question,
        answer: e.answer,
        keywords: e.keywords,
        url: e.url,
        source: e.source,
        vector: e.vector,
      })),
    },
    { headers: { 'cache-control': 'public, max-age=3600, s-maxage=3600' } },
  );
}
