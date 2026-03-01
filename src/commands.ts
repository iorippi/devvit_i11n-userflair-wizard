export function parseTierCommand(body: string): { tierId: string } | null {
  const trimmed = body.trim();
  const match = trimmed.match(/^!tier=([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  return { tierId: match[1] };
}
