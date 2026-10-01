import { afterEach, describe, expect, it, vi } from 'vitest'
import { AiError } from './types'
import { isChatModelId, listProviderModels, orderModelIds } from './models'

afterEach(() => {
  vi.unstubAllGlobals()
})

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('isChatModelId', () => {
  it('keeps chat models and drops embedding, speech, and image models', () => {
    expect(isChatModelId('gpt-4o')).toBe(true)
    expect(isChatModelId('claude-haiku-4-5-20251001')).toBe(true)
    expect(isChatModelId('gemini-2.5-flash')).toBe(true)
    expect(isChatModelId('text-embedding-3-small')).toBe(false)
    expect(isChatModelId('whisper-1')).toBe(false)
    expect(isChatModelId('dall-e-3')).toBe(false)
    expect(isChatModelId('tts-1')).toBe(false)
  })
})

describe('orderModelIds', () => {
  it('puts the preferred id first and sorts the rest', () => {
    expect(orderModelIds(['b', 'a', 'c', 'a'], 'c')).toEqual(['c', 'a', 'b'])
    expect(orderModelIds(['b', 'a'], 'missing')).toEqual(['a', 'b'])
  })
})

describe('listProviderModels', () => {
  it('lists OpenAI chat models with the bearer key and drops non-chat ids', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: [
          { id: 'text-embedding-3-small' },
          { id: 'gpt-4o' },
          { id: 'whisper-1' },
          { id: 'gpt-5.4-mini' },
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const models = await listProviderModels('openai', 'sk-test')

    expect(models.map((model) => model.id)).toEqual(['gpt-5.4-mini', 'gpt-4o'])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/models')
    expect(init.headers.Authorization).toBe('Bearer sk-test')
  })

  it('lists Anthropic models with the x-api-key header and follows one more page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          data: [{ id: 'claude-haiku-4-5', display_name: 'Claude Haiku' }],
          has_more: true,
          last_id: 'claude-haiku-4-5',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [{ id: 'claude-sonnet-4-5', display_name: 'Claude Sonnet' }],
          has_more: false,
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const models = await listProviderModels('anthropic', 'sk-ant-test')

    expect(models).toEqual([
      { id: 'claude-haiku-4-5', label: 'Claude Haiku' },
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet' },
    ])
    expect(fetchMock.mock.calls[0][1].headers['x-api-key']).toBe('sk-ant-test')
    expect(fetchMock.mock.calls[0][1].headers['anthropic-version']).toBe('2023-06-01')
    expect(String(fetchMock.mock.calls[1][0])).toContain('after_id=claude-haiku-4-5')
  })

  it('lists Gemini generateContent models and strips the models/ prefix', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          models: [
            {
              name: 'models/gemini-2.5-flash',
              displayName: 'Gemini 2.5 Flash',
              supportedGenerationMethods: ['generateContent'],
            },
            {
              name: 'models/text-embedding-004',
              displayName: 'Embedding',
              supportedGenerationMethods: ['embedContent'],
            },
            {
              name: 'models/gemini-embedding-001',
              displayName: 'Gemini Embedding',
              supportedGenerationMethods: ['generateContent', 'embedContent'],
            },
          ],
        }),
      ),
    )

    const models = await listProviderModels('gemini', 'AIza-test')
    expect(models).toEqual([
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    ])
  })

  it('rejects a catalog that only contains non-chat models', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          data: [{ id: 'text-embedding-3-small' }, { id: 'whisper-1' }],
        }),
      ),
    )

    await expect(listProviderModels('openai', 'sk-test')).rejects.toMatchObject({
      code: 'empty_response',
    })
  })

  it('maps a rejected key to invalid_key', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: { message: 'Incorrect API key' } }, 401),
      ),
    )

    await expect(listProviderModels('deepseek', 'sk-bad')).rejects.toBeInstanceOf(AiError)
    await expect(listProviderModels('deepseek', 'sk-bad')).rejects.toMatchObject({
      code: 'invalid_key',
    })
  })
})
