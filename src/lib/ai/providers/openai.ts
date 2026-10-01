import { AiError, type ProviderResult } from '../types'
import { MAX_OUTPUT_TOKENS } from '../defaults'
import {
  mergeConsecutive,
  normalizeUsage,
  providerHttpError,
  toNetworkError,
  type ProviderArgs,
} from './shared'

export interface OpenAiCompatibleEndpoint {
  url: string
  label: string
  /** OpenAI's newer models want `max_completion_tokens`. DeepSeek, Groq,
   *  and Gemini's OpenAI-compatible APIs still expect `max_tokens`. */
  maxTokensField: 'max_tokens' | 'max_completion_tokens'
}

export const OPENAI_COMPATIBLE_ENDPOINTS = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    label: 'OpenAI',
    maxTokensField: 'max_completion_tokens',
  },
  deepseek: {
    url: 'https://api.deepseek.com/chat/completions',
    label: 'DeepSeek',
    maxTokensField: 'max_tokens',
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    label: 'Groq',
    maxTokensField: 'max_tokens',
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    label: 'Gemini',
    maxTokensField: 'max_tokens',
  },
} as const satisfies Record<string, OpenAiCompatibleEndpoint>

interface OpenAiResponse {
  choices?: { message?: { content?: string } }[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

/**
 * Call OpenAI's Chat Completions endpoint with the caller's own key.
 * Returns the raw assistant text + token usage (handoff parsing happens
 * in `generateReply`).
 */
export async function generateOpenAi(args: ProviderArgs): Promise<ProviderResult> {
  return generateOpenAiCompatible(args, OPENAI_COMPATIBLE_ENDPOINTS.openai)
}

/**
 * Chat Completions call for OpenAI and the providers that speak the
 * same protocol (DeepSeek, Groq, Gemini).
 */
export async function generateOpenAiCompatible(
  args: ProviderArgs,
  endpoint: OpenAiCompatibleEndpoint,
): Promise<ProviderResult> {
  const { apiKey, model, systemPrompt, messages, timeoutMs } = args

  let res: Response
  try {
    res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...mergeConsecutive(messages),
        ],
        [endpoint.maxTokensField]: MAX_OUTPUT_TOKENS,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (err) {
    throw toNetworkError(err)
  }

  if (!res.ok) {
    throw await providerHttpError(endpoint.label, res)
  }

  const data = (await res.json().catch(() => null)) as OpenAiResponse | null
  const text = data?.choices?.[0]?.message?.content
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new AiError(`${endpoint.label} returned an empty response.`, {
      code: 'empty_response',
    })
  }
  const usage = normalizeUsage({
    prompt: data?.usage?.prompt_tokens,
    completion: data?.usage?.completion_tokens,
    total: data?.usage?.total_tokens,
  })
  return { text, usage }
}
