
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ProoflineApiError } from '../client.js';

export function jsonResult(payload: unknown): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

export function errorResult(message: string): CallToolResult {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

/**
 * Wrap a tool handler so any API error becomes a clean, model-
 * readable error result and unexpected throws don't crash the server.
 */
export function handle<A>(
  fn: (args: A) => Promise<CallToolResult>,
): (args: A) => Promise<CallToolResult> {
  return async (args: A) => {
    try {
      return await fn(args);
    } catch (err) {
      if (err instanceof ProoflineApiError) {
        return errorResult(`Proofline API error [${err.code}]: ${err.message}`);
      }
      return errorResult(`Unexpected error: ${(err as Error).message}`);
    }
  };
}
