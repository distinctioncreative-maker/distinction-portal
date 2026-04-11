import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { publicToken, orgId } = await req.json();

    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox';

    const baseUrl = plaidEnv === 'production'
      ? 'https://production.plaid.com'
      : plaidEnv === 'development'
        ? 'https://development.plaid.com'
        : 'https://sandbox.plaid.com';

    // Exchange public token for access token
    const exchangeRes = await fetch(`${baseUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        public_token: publicToken,
      }),
    });

    const { access_token, item_id, error_message } = await exchangeRes.json();
    if (!exchangeRes.ok) throw new Error(error_message || 'Token exchange failed');

    // Store in Supabase (access_token stays server-side)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('integration_connections').upsert({
      organization_id: orgId,
      provider: 'plaid',
      status: 'active',
      config: { item_id, access_token },
      connected_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,provider' });

    return new Response(JSON.stringify({ success: true, item_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
