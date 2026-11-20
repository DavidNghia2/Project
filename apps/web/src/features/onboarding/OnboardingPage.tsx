import React, { useMemo, useState } from 'react';
import { Building2, LoaderCircle } from 'lucide-react';
import { Alert, Button, Input, Select } from '../../design-system';
import { useAuth } from '../auth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

function makeSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const OnboardingPage: React.FC = () => {
  const { user, refreshSession, signOut } = useAuth();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [industryCode, setIndustryCode] = useState('GENERAL');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const derivedSlug = useMemo(() => slug || makeSlug(companyName), [slug, companyName]);

  if (user?.profileStatus !== 'active') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <section className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 space-y-4 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Tài khoản chưa hoạt động</h1>
          <p className="text-sm text-slate-600">Tài khoản của bạn đã bị vô hiệu hóa. Hãy liên hệ quản trị viên công ty.</p>
          <Button fullWidth onClick={() => void signOut().then(() => navigate('/', { replace: true }))}>Đăng xuất</Button>
        </section>
      </main>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (companyName.trim().length < 2 || derivedSlug.length < 2) {
      setError('Nhập tên công ty và mã công ty có ít nhất 2 ký tự.');
      return;
    }
    setSubmitting(true);
    const { error: invokeError } = await supabase.functions.invoke('onboard-company', {
      body: {
        companyName: companyName.trim(),
        companySlug: derivedSlug,
        industryCode,
      },
    });
    if (invokeError) {
      setError(invokeError.message);
      setSubmitting(false);
      return;
    }
    await refreshSession();
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <section className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-slate-500">Xin chào {user?.fullName || user?.email}</p>
            <h1 className="text-2xl font-bold text-slate-900">Tạo công ty của bạn</h1>
            <p className="text-sm text-slate-600 mt-1">Bạn sẽ trở thành Admin và Owner của công ty.</p>
          </div>
        </div>

        {error && <Alert variant="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Tên công ty" value={companyName} onChange={(event) => setCompanyName(event.target.value)} required placeholder="Ví dụ: Công ty An Phát" />
          <Input label="Mã công ty" value={slug} onChange={(event) => setSlug(makeSlug(event.target.value))} required placeholder={derivedSlug || 'cong-ty-an-phat'} hint="Dùng trong địa chỉ nội bộ, chỉ gồm chữ thường, số và dấu gạch ngang." />
          <Select label="Lĩnh vực" value={industryCode} onChange={(event) => setIndustryCode(event.target.value)} options={[
            { value: 'GENERAL', label: 'Kinh doanh tổng hợp' },
            { value: 'RETAIL', label: 'Bán lẻ' },
            { value: 'MANUFACTURING', label: 'Sản xuất' },
            { value: 'FOOD', label: 'Thực phẩm và đồ uống' },
          ]} />
          <Button type="submit" fullWidth loading={submitting} iconLeft={submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}>Tạo công ty</Button>
        </form>

        <p className="text-sm text-slate-600 border-t border-slate-200 pt-4">Đã nhận lời mời? Hãy mở liên kết trong email sau khi đăng nhập bằng đúng địa chỉ email được mời.</p>
      </section>
    </main>
  );
};
