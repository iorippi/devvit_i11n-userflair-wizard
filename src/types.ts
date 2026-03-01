export type EnforcementMode = "warn" | "hard";

export interface TierDef {
  id: string;
  label: string;
  description: string;
  topLevelDefaultAllowed: boolean;
}

export interface MessageTemplates {
  invalidFlair: string;
  disallowedTier: string;
  commandApplied: string;
}

export interface SubredditConfig {
  version: number;
  tiers: TierDef[];
  defaultPostTier: string;
  allowGeneralTierCommand: boolean;
  allowOpTierCommand: boolean;
  allowModTierCommand: boolean;
  enforcementMode: EnforcementMode;
  autoUpdatePostFlairText: boolean;
  syncAutoMod: boolean;
  gracePeriodDays: number;
  messageTemplates: MessageTemplates;
  flairFormatRegex?: string;
}

export interface PostTierState {
  postId: string;
  requiredTierId: string;
  updatedBy: string;
  updatedAt: number;
}

export interface UserProfileCache {
  tierId: string;
  icon: string;
  identity: string;
  freeText: string;
  flairText: string;
  updatedAt: number;
}

export interface ParsedFlair {
  tierId: string;
  icon: string;
  identity: string;
  freeText: string;
}

export interface EnforcementLogEntry {
  id: string;
  createdAt: number;
  subredditId?: string;
  postId?: string;
  commentId?: string;
  username?: string;
  action: string;
  reason: string;
}
