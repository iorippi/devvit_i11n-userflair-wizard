import type { PostTierState, SubredditConfig } from "./types.js";

export function isTopLevelComment(comment: { parentId?: string | undefined; postId?: string | undefined }): boolean {
  if (!comment.parentId || !comment.postId) return false;
  return comment.parentId === comment.postId;
}

export function getRequiredTierForPost(
  state: PostTierState | null,
  config: SubredditConfig
): string {
  return state?.requiredTierId ?? config.defaultPostTier;
}

export function isUserAllowedTopLevel(userTierId: string, requiredTierId: string): boolean {
  return userTierId.toLowerCase() === requiredTierId.toLowerCase();
}

export function isInGracePeriod(installedAt: number, gracePeriodDays: number): boolean {
  const ms = gracePeriodDays * 24 * 60 * 60 * 1000;
  return Date.now() < installedAt + ms;
}
