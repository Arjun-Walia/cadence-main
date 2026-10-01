
export interface Config {
  baseUrl: string;
  apiKey: string;
  enableWrites: boolean;
  enableBroadcasts: boolean;
}

function truthy(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export function loadConfig(): Config {
  const baseUrlRaw = process.env.CADENCE_BASE_URL?.trim();
  const apiKey = process.env.CADENCE_API_KEY?.trim();

  const missing: string[] = [];
  if (!baseUrlRaw) missing.push('CADENCE_BASE_URL');
  if (!apiKey) missing.push('CADENCE_API_KEY');
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `Set CADENCE_BASE_URL to your instance URL (e.g. https://crm.example.com) ` +
        `and CADENCE_API_KEY to a key from Settings → API keys.`,
    );
  }

  // Normalise: strip a trailing slash so path joins are predictable.
  const baseUrl = baseUrlRaw!.replace(/\/+$/, '');
  if (!/^https?:\/\//.test(baseUrl)) {
    throw new Error(
      `CADENCE_BASE_URL must start with http:// or https:// (got "${baseUrl}").`,
    );
  }

  const enableWrites = truthy(process.env.CADENCE_ENABLE_WRITES);
  const enableBroadcasts = truthy(process.env.CADENCE_ENABLE_BROADCASTS);

  if (enableBroadcasts && !enableWrites) {
    throw new Error(
      'CADENCE_ENABLE_BROADCASTS requires CADENCE_ENABLE_WRITES to also be set.',
    );
  }

  return {
    baseUrl,
    apiKey: apiKey!,
    enableWrites,
    enableBroadcasts,
  };
}
