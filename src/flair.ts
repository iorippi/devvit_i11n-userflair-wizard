import type { ParsedFlair, SubredditConfig, UserProfileCache } from "./types.js";

export function formatFlair(profile: UserProfileCache): string {
  return `${profile.tierId} ${profile.icon} ${profile.identity} | ${profile.freeText}`.trim();
}

export function parseFlair(flairText?: string, flairFormatRegex?: string): ParsedFlair | null {
  if (!flairText) return null;

  const pattern = flairFormatRegex ?? "^(\\S+)\\s+(.+?)\\s+(.+?)\\s+\\|\\s+(.+)$";
  const re = new RegExp(pattern);
  const match = flairText.trim().match(re);
  if (!match) return null;

  const [, tierId, icon, identity, freeText] = match;
  return {
    tierId: tierId.trim(),
    icon: icon.trim(),
    identity: identity.trim(),
    freeText: freeText.trim(),
  };
}

export function validateParsedFlair(
  parsed: ParsedFlair | null,
  config: SubredditConfig
): { valid: boolean; reason?: string } {
  if (!parsed) return { valid: false, reason: "flair_not_parseable" };
  if (!config.tiers.some((t) => t.id.toLowerCase() === parsed.tierId.toLowerCase())) {
    return { valid: false, reason: "tier_not_allowed" };
  }
  if (!parsed.identity) return { valid: false, reason: "identity_empty" };
  if (parsed.freeText.length > 64) return { valid: false, reason: "free_text_too_long" };
  if (/\n|\r|\t/.test(parsed.identity + parsed.freeText)) {
    return { valid: false, reason: "control_chars_disallowed" };
  }
  return { valid: true };
}
