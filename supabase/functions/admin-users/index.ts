import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') ?? 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type InvitePayload = {
  action: 'invite';
  email: string;
  roleCode: string;
  warehouseIds?: string[];
};
type UpdatePayload = {
  action: 'update';
  userId: string;
  roleCode: string;
  status: 'active' | 'inactive';
  warehouseIds?: string[];
};
type TransferPayload = { action: 'transfer-owner'; userId: string };
type RequestPayload = InvitePayload | UpdatePayload | TransferPayload;

async function sendInvitationEmail(recipient: string, invitationUrl: string): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const sender = Deno.env.get('INVITATION_FROM_EMAIL');
  if (!resendApiKey || !sender) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: 'Lời mời tham gia Smart Inventory',
      html: `<p>Bạn được mời tham gia công ty trên Smart Inventory.</p><p><a href="${invitationUrl}">Chấp nhận lời mời</a></p>`,
    }),
  });
  return response.ok;
}

function safeErrorMessage(error: { code?: string; message?: string }): string {
  // Preserve explicit domain errors raised by PL/pgSQL RAISE EXCEPTION (P0001),
  // hide raw PostgreSQL internal/schema error messages for all other codes.
  if (error.code === 'P0001' && error.message) {
    return error.message;
  }
  return 'Request could not be completed.';
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ') || authorization.length <= 7) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } } }
  );
  const payload = (await request.json().catch(() => null)) as RequestPayload | null;
  if (!payload || typeof payload !== 'object' || !('action' in payload)) {
    return Response.json({ error: 'Action is required.' }, { status: 400, headers: corsHeaders });
  }

  switch (payload.action) {
    case 'update': {
      if (!payload.userId || !payload.roleCode || !payload.status) {
        return Response.json({ error: 'Missing required fields for update.' }, { status: 400, headers: corsHeaders });
      }
      const { error } = await supabase.rpc('update_company_member', {
        target_user_id: payload.userId,
        next_role_code: payload.roleCode,
        next_status: payload.status,
        warehouse_ids: payload.warehouseIds ?? [],
      });
      if (error) return Response.json({ error: safeErrorMessage(error) }, { status: 400, headers: corsHeaders });
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    case 'transfer-owner': {
      if (!payload.userId) {
        return Response.json({ error: 'Target userId is required.' }, { status: 400, headers: corsHeaders });
      }
      const { error } = await supabase.rpc('transfer_company_ownership', { target_user_id: payload.userId });
      if (error) return Response.json({ error: safeErrorMessage(error) }, { status: 400, headers: corsHeaders });
      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    case 'invite': {
      if (!payload.email || !payload.roleCode) {
        return Response.json({ error: 'Email and roleCode are required.' }, { status: 400, headers: corsHeaders });
      }
      const { data, error } = await supabase.rpc('create_company_invitation', {
        invitee_email: payload.email,
        invited_role: payload.roleCode,
        warehouse_ids: payload.warehouseIds ?? [],
      });
      if (error) return Response.json({ error: safeErrorMessage(error) }, { status: 400, headers: corsHeaders });

      const invitation = Array.isArray(data) ? data[0] : data;
      const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';
      const invitationUrl = `${appUrl}/accept-invitation?token=${encodeURIComponent(invitation.invitation_token)}`;
      const emailSent = await sendInvitationEmail(payload.email, invitationUrl);
      return Response.json({ invitationId: invitation.invitation_id, emailSent, invitationUrl }, { headers: corsHeaders });
    }

    default:
      return Response.json({ error: 'Unsupported action.' }, { status: 400, headers: corsHeaders });
  }
});
