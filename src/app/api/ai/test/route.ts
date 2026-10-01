import { NextResponse } from 'next/server'
import { requireRole, toErrorResponse } from '@/lib/auth/account'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { decrypt } from '@/lib/whatsapp/encryption'
import { listProviderModels } from '@/lib/ai/models'
import { AiError, isAiProvider } from '@/lib/ai/types'

/**
 * POST /api/ai/test  (admin+)
 *
 * Confirm a provider key WITHOUT saving, by loading that provider's
 * model catalog. A chat ping is the wrong check: it fails when the
 * form still holds a guessed model this key cannot call. When
 * `api_key` is omitted the stored key is used, but only if it was
 * saved for the same provider — a key for OpenAI must not be sent to
 * Anthropic. Returns `{ ok: true, models: [{ id, label }] }`.
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId, userId } = await requireRole('admin')

    const limit = checkRateLimit(`ai-test:${userId}`, RATE_LIMITS.adminAction)
    if (!limit.success) return rateLimitResponse(limit)

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const provider = body.provider
    if (!isAiProvider(provider)) {
      return NextResponse.json(
        { error: 'Choose OpenAI, Anthropic, DeepSeek, Groq, or Gemini' },
        { status: 400 },
      )
    }
    const rawKey = typeof body.api_key === 'string' ? body.api_key.trim() : ''
    let apiKeyPlain = rawKey
    if (!apiKeyPlain) {
      const { data: existing } = await supabase
        .from('ai_configs')
        .select('provider, api_key')
        .eq('account_id', accountId)
        .maybeSingle()
      if (!existing?.api_key || existing.provider !== provider) {
        return NextResponse.json(
          { error: 'Enter an API key for this provider.' },
          { status: 400 },
        )
      }
      try {
        apiKeyPlain = decrypt(existing.api_key)
      } catch {
        return NextResponse.json(
          { error: 'Stored API key could not be decrypted — re-enter your key.' },
          { status: 400 },
        )
      }
    }

    try {
      const models = await listProviderModels(provider, apiKeyPlain)
      return NextResponse.json({ ok: true, models })
    } catch (err) {
      if (err instanceof AiError) {
        return NextResponse.json(
          { error: err.message, code: err.code },
          { status: 400 },
        )
      }
      console.error('[ai/test] validation error:', err)
      return NextResponse.json(
        { error: 'Could not validate the API key.' },
        { status: 400 },
      )
    }
  } catch (err) {
    return toErrorResponse(err)
  }
}
