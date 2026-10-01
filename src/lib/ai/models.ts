import { AI_PROVIDER_DEFAULT_MODEL, AI_PROVIDER_LABEL, aiRequestTimeoutMs } from './defaults'
import { providerHttpError, toNetworkError } from './providers/shared'
import { AiError, type AiProvider } from './types'

export interface ProviderModel {
  id: string
  label: string
}

/** Models that cannot answer a chat completion. Everything else the
 *  provider lists is shown, so a new chat model is not hidden behind a
 *  hardcoded allow-list. */
const NON_CHAT =
  /embed|whisper|tts|transcri|dall-e|moderation|imagen|imagegeneration|realtime|\bsora\b|speech|audio-preview|davinci|babbage|\bada\b|curie/i

export function isChatModelId(id: string): boolean {
  const trimmed = id.trim()
  if (!trimmed) return false
  return !NON_CHAT.test(trimmed)
}

/** Stable order: the provider default first when the account can
 *  actually use it, then the rest A–Z. */
export function orderModelIds(ids: string[], preferred?: string): string[] {
  const unique = [
    ...new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0)),
  ]
  unique.sort((a, b) => a.localeCompare(b))
  if (!preferred || !unique.includes(preferred)) return unique
  return [preferred, ...unique.filter((id) => id !== preferred)]
}

interface ListSpec {
  url: string
  headers: (apiKey: string) => Record<string, string>
}

function listSpec(provider: AiProvider, apiKey: string): ListSpec {
  if (provider === 'anthropic') {
    return {
      url: 'https://api.anthropic.com/v1/models',
      headers: () => ({
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      }),
    }
  }
  if (provider === 'gemini') {
    return {
      url: 'https://generativelanguage.googleapis.com/v1beta/models',
      headers: () => ({ Authorization: `Bearer ${apiKey}` }),
    }
  }
  const url =
    provider === 'openai'
      ? 'https://api.openai.com/v1/models'
      : provider === 'deepseek'
        ? 'https://api.deepseek.com/models'
        : 'https://api.groq.com/openai/v1/models'
  return {
    url,
    headers: () => ({ Authorization: `Bearer ${apiKey}` }),
  }
}

async function fetchJson(
  provider: AiProvider,
  url: string,
  headers: Record<string, string>,
): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(aiRequestTimeoutMs()),
    })
  } catch (err) {
    throw toNetworkError(err)
  }
  if (!res.ok) throw await providerHttpError(AI_PROVIDER_LABEL[provider], res)
  return res.json().catch(() => null)
}

function readOpenAiIds(body: unknown): string[] {
  if (!body || typeof body !== 'object') return []
  const data = (body as { data?: unknown }).data
  if (!Array.isArray(data)) return []
  return data.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const id = (row as { id?: unknown }).id
    return typeof id === 'string' ? [id] : []
  })
}

function readAnthropic(body: unknown): { ids: string[]; labels: Map<string, string>; next: string | null } {
  const labels = new Map<string, string>()
  if (!body || typeof body !== 'object') return { ids: [], labels, next: null }
  const record = body as { data?: unknown; has_more?: unknown; last_id?: unknown }
  const data = Array.isArray(record.data) ? record.data : []
  const ids = data.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const id = (row as { id?: unknown }).id
    if (typeof id !== 'string') return []
    const display = (row as { display_name?: unknown }).display_name
    if (typeof display === 'string' && display.trim()) labels.set(id, display.trim())
    return [id]
  })
  const next =
    record.has_more === true && typeof record.last_id === 'string'
      ? record.last_id
      : null
  return { ids, labels, next }
}

function readGemini(body: unknown): { ids: string[]; labels: Map<string, string>; next: string | null } {
  const labels = new Map<string, string>()
  if (!body || typeof body !== 'object') return { ids: [], labels, next: null }
  const record = body as { models?: unknown; nextPageToken?: unknown }
  const models = Array.isArray(record.models) ? record.models : []
  const ids = models.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const methods = (row as { supportedGenerationMethods?: unknown }).supportedGenerationMethods
    if (
      Array.isArray(methods) &&
      methods.length > 0 &&
      !methods.includes('generateContent')
    ) {
      return []
    }
    const name = (row as { name?: unknown }).name
    if (typeof name !== 'string') return []
    const id = name.replace(/^models\//, '')
    const display = (row as { displayName?: unknown }).displayName
    if (typeof display === 'string' && display.trim()) labels.set(id, display.trim())
    return [id]
  })
  const next = typeof record.nextPageToken === 'string' ? record.nextPageToken : null
  return { ids, labels, next }
}

/**
 * Confirm the key by asking the provider for its model catalog.
 * A chat ping is the wrong check here: it fails whenever the form's
 * model string is one this key cannot call, even when the key itself
 * is valid.
 */
export async function listProviderModels(
  provider: AiProvider,
  apiKey: string,
): Promise<ProviderModel[]> {
  const spec = listSpec(provider, apiKey)
  const labels = new Map<string, string>()
  const ids: string[] = []

  if (provider === 'anthropic') {
    let after: string | null = null
    for (let page = 0; page < 5; page++) {
      const url = after
        ? `${spec.url}?limit=100&after_id=${encodeURIComponent(after)}`
        : `${spec.url}?limit=100`
      const parsed = readAnthropic(await fetchJson(provider, url, spec.headers(apiKey)))
      ids.push(...parsed.ids)
      for (const [id, label] of parsed.labels) labels.set(id, label)
      if (!parsed.next) break
      after = parsed.next
    }
  } else if (provider === 'gemini') {
    let token: string | null = null
    for (let page = 0; page < 5; page++) {
      const url = token
        ? `${spec.url}?pageSize=100&pageToken=${encodeURIComponent(token)}`
        : `${spec.url}?pageSize=100`
      const parsed = readGemini(await fetchJson(provider, url, spec.headers(apiKey)))
      ids.push(...parsed.ids)
      for (const [id, label] of parsed.labels) labels.set(id, label)
      if (!parsed.next) break
      token = parsed.next
    }
  } else {
    ids.push(...readOpenAiIds(await fetchJson(provider, spec.url, spec.headers(apiKey))))
  }

  const usable = ids.filter(isChatModelId)
  if (usable.length === 0) {
    throw new AiError(
      `${AI_PROVIDER_LABEL[provider]} accepted the key but returned no chat models.`,
      { code: 'empty_response' },
    )
  }

  return orderModelIds(usable, AI_PROVIDER_DEFAULT_MODEL[provider]).map((id) => ({
    id,
    label: labels.get(id) ?? id,
  }))
}
