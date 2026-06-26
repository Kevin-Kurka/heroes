import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/structured-data';

/**
 * robots.txt. We explicitly welcome AI/answer-engine crawlers (ChatGPT,
 * Claude, Perplexity, Gemini/Google AI Overviews, Apple Intelligence, Copilot)
 * so the site is eligible to be cited when people ask an assistant for the best
 * sports bar or food near Carlsbad. Only the staff print view is disallowed.
 *
 * Note: an explicit user-agent block overrides the `*` block for that bot, so
 * each AI agent is listed with the same allow/disallow as everyone else.
 */
const AI_CRAWLERS = [
  'GPTBot', // OpenAI
  'OAI-SearchBot', // ChatGPT search
  'ChatGPT-User', // ChatGPT browsing (user-initiated)
  'ClaudeBot', // Anthropic
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot', // Perplexity
  'Perplexity-User',
  'Google-Extended', // Gemini / Google AI Overviews grounding
  'Applebot', // Apple / Siri / Spotlight
  'Applebot-Extended',
  'Bingbot', // Microsoft Copilot
  'CCBot', // Common Crawl (feeds many models)
  'DuckAssistBot', // DuckDuckGo AI
  'cohere-ai',
  'Amazonbot',
  'meta-externalagent', // Meta AI
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ['/menu/printable'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // No `host` directive — it's a Yandex-only field that Googlebot flags as an
    // ignored rule. Canonical host is enforced via redirects + canonical tags.
  };
}
