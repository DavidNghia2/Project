import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Alert, Button } from '../../design-system';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const AcceptInvitationPage: React.FC = () => {
  const { refreshSession } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = params.get('token') ?? '';

  useEffect(() => {
    if (!token) setError('Liên kết lời mời không hợp lệ.');
  }, [token]);

  const accept = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const { error: acceptError } = await supabase.rpc('accept_invitation', { invitation_token: token });
    if (acceptError) {
      setError(acceptError.message);
      setLoading(false);
      return;
    }
    await refreshSession();
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 space-y-5 shadow-sm text-center">
        <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
        <div><h1 className="text-xl font-bold text-slate-900">Tham gia công ty</h1><p className="text-sm text-slate-600 mt-2">Xác nhận để tham gia công ty theo lời mời gửi đến email của bạn.</p></div>
        {error && <Alert variant="error" message={error} />}
        <Button fullWidth onClick={() => void accept()} loading={loading} disabled={!token}>Chấp nhận lời mời</Button>
      </section>
    </main>
  );
};
