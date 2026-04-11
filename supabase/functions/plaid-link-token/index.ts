import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { userId, orgId } = await req.json();

    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox';

    if (!plaidClientId || !plaidSecret) {
      throw new Error('Plaid credentials not configured. Set PLAID_CLIENT_ID and PLAID_SECRET.');
    }

    const baseUrl = plaidEnv === 'production'
      ? 'https://production.plaid.com'
      : plaidEnv === 'development'
        ? 'https://development.plaid.com'
        : 'https://sandbox.plaid.com';

    const response = await fetch(`${baseUrl}/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        client_name: 'Distinction OS',
        user: { client_user_id: userId },
        products: ['transactions'],
        country_codes: ['US'],
        language: 'en',
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error_message || 'Plaid error');

    return new Response(JSON.stringify({ link_token: data.link_token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
