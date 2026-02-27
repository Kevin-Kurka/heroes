import { NextRequest, NextResponse } from 'next/server';
import { refreshInstagramToken } from '@/lib/instagram';

/**
 * Cron endpoint: refreshes the Instagram long-lived token and
 * updates the Vercel environment variable so the next build uses it.
 *
 * Secured by CRON_SECRET (Vercel automatically sends this header
 * for cron jobs configured in vercel.json).
 */
export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const newToken = await refreshInstagramToken();
  if (!newToken) {
    return NextResponse.json(
      { error: 'Failed to refresh Instagram token' },
      { status: 500 }
    );
  }

  // Update the env var on Vercel so future builds/functions use the new token
  const updated = await updateVercelEnvVar('INSTAGRAM_ACCESS_TOKEN', newToken);

  if (!updated) {
    return NextResponse.json(
      { error: 'Token refreshed but failed to update Vercel env var', tokenRefreshed: true },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Instagram token refreshed and Vercel env updated',
  });
}

/**
 * Updates (or creates) an environment variable on Vercel using the REST API.
 */
async function updateVercelEnvVar(key: string, value: string): Promise<boolean> {
  const vercelToken = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!vercelToken || !projectId) {
    console.error('Missing VERCEL_TOKEN or VERCEL_PROJECT_ID — cannot update env var');
    return false;
  }

  const headers = {
    Authorization: `Bearer ${vercelToken}`,
    'Content-Type': 'application/json',
  };

  const baseUrl = `https://api.vercel.com/v10/projects/${projectId}/env`;

  try {
    // First, try to find the existing env var
    const listRes = await fetch(baseUrl, { headers });
    if (!listRes.ok) {
      console.error(`Vercel list env vars failed: ${listRes.status}`);
      return false;
    }

    const listData = await listRes.json();
    const existing = listData.envs?.find(
      (env: { key: string }) => env.key === key
    );

    if (existing) {
      // Update existing env var (PATCH)
      const patchRes = await fetch(`${baseUrl}/${existing.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ value }),
      });

      if (!patchRes.ok) {
        console.error(`Vercel update env var failed: ${patchRes.status}`);
        return false;
      }
    } else {
      // Create new env var
      const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key,
          value,
          type: 'encrypted',
          target: ['production', 'preview'],
        }),
      });

      if (!createRes.ok) {
        console.error(`Vercel create env var failed: ${createRes.status}`);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Vercel env var update error:', err);
    return false;
  }
}
