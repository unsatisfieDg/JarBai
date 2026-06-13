// src/utils/openrouter.js
// OpenRouter API client with streaming support

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

/**
 * Stream a chat completion from OpenRouter.
 * @param {object} params
 * @param {string} params.apiKey - OpenRouter API key
 * @param {string} params.model - Model ID
 * @param {Array}  params.messages - [{role, content}]
 * @param {function} params.onChunk - Called with each text chunk as it arrives
 * @param {function} params.onDone - Called when stream completes
 * @param {function} params.onError - Called on error
 * @returns {AbortController} - Call .abort() to cancel the stream
 */
export async function streamChat({ apiKey, model, messages, onChunk, onDone, onError }) {
  const controller = new AbortController();

  try {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jarbai.app',
        'X-Title': 'JarBai',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData?.error?.message || `HTTP ${response.status}`;
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenRouter API key in Settings.');
      } else if (response.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment and try again.');
      } else {
        throw new Error(`OpenRouter error: ${msg}`);
      }
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const chunk = json.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch {
          // malformed SSE chunk — skip
        }
      }
    }

    onDone();
  } catch (err) {
    if (err.name === 'AbortError') return; // user cancelled
    onError(err.message || 'Unknown error occurred');
  }

  return controller;
}

/**
 * Non-streaming single chat completion (fallback).
 */
export async function sendChat({ apiKey, model, messages }) {
  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://jarbai.app',
      'X-Title': 'JarBai',
    },
    body: JSON.stringify({ model, messages, max_tokens: 4096 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
