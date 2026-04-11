/**
 * Model-agnostic AI adapter.
 *
 * Switch provider with a single env var:
 *   VITE_AI_PROVIDER=local        → Ollama at localhost:11434 (free, no proxy)
 *   VITE_AI_PROVIDER=anthropic    → Claude via Supabase Edge Function proxy
 *   VITE_AI_PROVIDER=openai       → OpenAI via Supabase Edge Function proxy
 *
 * For local: also set VITE_LOCAL_MODEL (default: llama3.2)
 * For hosted: set API keys as Supabase secrets (never in .env)
 */

import { supabase } from '@/lib/supabaseClient';

const PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'local';
const LOCAL_MODEL = import.meta.env.VITE_LOCAL_MODEL || 'llama3.2';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ── Local (Ollama) ────────────────────────────────────────────────────────────
async function callLocal(messages) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LOCAL_MODEL,
      messages,
      stream: false,
    }),
  });
  if (!response.ok) {
    throw new Error(`Local model error: ${response.status}. Is Ollama running?`);
  }
  const data = await response.json();
  return data.message?.content || '';
}

// ── Hosted (Anthropic / OpenAI via Edge Function proxy) ──────────────────────
async function callHosted(messages) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, provider: PROVIDER }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI proxy error ${response.status}: ${err}`);
  }
  const data = await response.json();
  return data.content || '';
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Send a single user message and get a response.
 * @param {string} prompt
 * @param {string} [systemPrompt] - optional system context
 * @returns {Promise<string>}
 */
export async function askAI(prompt, systemPrompt) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });
  return PROVIDER === 'local' ? callLocal(messages) : callHosted(messages);
}

/**
 * Send a conversation history and get a response.
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} [systemPrompt]
 * @returns {Promise<string>}
 */
export async function chatAI(messages, systemPrompt) {
  const all = [];
  if (systemPrompt) all.push({ role: 'system', content: systemPrompt });
  all.push(...messages);
  return PROVIDER === 'local' ? callLocal(all) : callHosted(all);
}

export const aiProvider = PROVIDER;
