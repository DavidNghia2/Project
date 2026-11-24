export function invitationDestination(value: string | null): string | null {
  if (!value || !value.startsWith('/accept-invitation?') || value.startsWith('//')) return null;
  const url = new URL(value, window.location.origin);
  return url.pathname === '/accept-invitation' && url.searchParams.has('token')
    ? url.pathname + url.search
    : null;
}

export function authenticationUrl(path: '/login' | '/register', destination: string): string {
  return `${path}?next=${encodeURIComponent(destination)}`;
}
