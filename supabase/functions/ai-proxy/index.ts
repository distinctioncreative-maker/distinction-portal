import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, provider } = await req.json();

    let content = '';

    if (provider === 'anthropic') {
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

      // Separate system message from conversation messages
      const systemMsg = messages.find((m: any) => m.role === 'system');
      const chatMessages = messages.filter((m: any) => m.role !== 'system');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemMsg?.content,
          messages: chatMessages,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Anthropic error');
      content = data.content?.[0]?.text || '';

    } else if (provider === 'openai') {
      const apiKey = Deno.env.get('OPENAI_API_KEY');
      if (!apiKey) throw new Error('OPENAI_API_KEY not set');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'OpenAI error');
      content = data.choices?.[0]?.message?.content || '';

    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
