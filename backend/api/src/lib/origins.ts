function normalizeOrigin(value: string): string | null {
  const cleaned = value.trim().replace(/\/+$/, '');
  if (!cleaned) return null;
  return cleaned;
}

export function getAllowedOrigins(): string[] {
  const values = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
    process.env.EXTENSION_ORIGIN,
    'http://localhost:3000',
  ]
    .filter(Boolean)
    .flatMap((entry) => String(entry).split(','))
    .map((entry) => normalizeOrigin(entry))
    .filter((entry): entry is string => Boolean(entry));

  return Array.from(new Set(values));
}

export function isAllowedOrigin(
  origin: string | undefined,
  allowedOrigins: string[],
): boolean {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  return allowedOrigins.includes(normalized);
}
