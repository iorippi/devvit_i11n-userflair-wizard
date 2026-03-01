import type { SubredditConfig } from "./types.js";

export const CONFIG_VERSION = 1;

export function defaultSubredditConfig(): SubredditConfig {
  return {
    version: CONFIG_VERSION,
    tiers: [
      {
        id: "1",
        label: "Tier 1",
        description: "National / diaspora",
        topLevelDefaultAllowed: true,
      },
      {
        id: "2a",
        label: "Tier 2a",
        description: "Current/past resident",
        topLevelDefaultAllowed: false,
      },
      {
        id: "2b",
        label: "Tier 2b",
        description: "Topic entitlement/specialist",
        topLevelDefaultAllowed: false,
      },
      {
        id: "3",
        label: "Tier 3",
        description: "Everyone else",
        topLevelDefaultAllowed: false,
      },
    ],
    defaultPostTier: "1",
    allowGeneralTierCommand: false,
    allowOpTierCommand: true,
    allowModTierCommand: true,
    enforcementMode: "warn",
    autoUpdatePostFlairText: true,
    syncAutoMod: true,
    gracePeriodDays: 30,
    messageTemplates: {
      invalidFlair:
        "Your comment was filtered because your user flair is missing or invalid. Please set it with the Flair Wizard.",
      disallowedTier:
        "Your tier is not allowed for top-level comments in this thread.",
      commandApplied: "Post tier requirement updated.",
    },
    flairFormatRegex: "^(\\S+)\\s+(.+?)\\s+(.+?)\\s+\\|\\s+(.+)$",
  };
}
