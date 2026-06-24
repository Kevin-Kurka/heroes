import { NextRequest, NextResponse } from 'next/server';
import { search } from '@/lib/ask';

/**
 * GET /api/ask?q=...  — semantic retrieval over the vectorized FAQ. Returns the
 * best-matching first-party answers (the "answer already in context" surface for
 * an on-site chat widget or any assistant). Embedding + cosine match run on the
 * server; no external API. Also accepts POST { q }.
 */
export const revalidate = 3600;

function answer(q: string | null) {
  const query = (q ?? '').trim();
  if (!query) {
    return NextResponse.json(
      { error: 'Pass a question as ?q=' , example: '/api/ask?q=best sports bar in north county' },
      { status: 400 },
    );
  }
  const hits = search(query, 3);
  const top = hits[0];
  return NextResponse.json({
    query,
    answer: top && top.score > 0 ? top.answer : null,
    source: top?.url ?? null,
    results: hits,
    business: 'American Heroes & Brew, 300 Carlsbad Village Drive, Carlsbad, CA 92008',
  });
}

export async function GET(req: NextRequest) {
  return answer(req.nextUrl.searchParams.get('q'));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return answer(typeof body?.q === 'string' ? body.q : null);
}
