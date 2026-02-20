export function backendUrl(path: string): string {
  const base =
    import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';

  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
