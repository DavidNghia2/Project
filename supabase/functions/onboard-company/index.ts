import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') ?? 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  const authorization = request.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } } }
  );
  const payload = await request.json().catch(() => null) as {
    companyName?: string;
    companySlug?: string;
    industryCode?: string;
  } | null;

  if (!payload?.companyName || !payload.companySlug) {
    return Response.json({ error: 'Company name and slug are required.' }, { status: 400, headers: corsHeaders });
  }

  const { data, error } = await supabase.rpc('onboard_company', {
    company_name: payload.companyName,
    company_slug: payload.companySlug,
    industry_code: payload.industryCode ?? 'GENERAL',
  });

  if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });
  return Response.json({ companyId: data }, { headers: corsHeaders });
});
