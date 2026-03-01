import { parseTierCommand } from "./commands.js";
import { parseFlair, validateParsedFlair } from "./flair.js";
import {
  appendEnforcementLog,
  getPostTierState,
  getSubredditConfig,
  setPostTierState,
} from "./storage.js";
import { getRequiredTierForPost, isTopLevelComment, isUserAllowedTopLevel } from "./policy.js";

type TriggerContext = any;

function logId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function handlePostCreate(event: any, context: TriggerContext): Promise<void> {
  if (!event.postId) return;
  const subredditId = event.subreddit?.id ?? event.subredditId;
  if (!subredditId) return;

  const config = await getSubredditConfig(context, subredditId);
  await setPostTierState(context, {
    postId: event.postId,
    requiredTierId: config.defaultPostTier,
    updatedBy: "system",
    updatedAt: Date.now(),
  });
}

export async function handleCommentCreate(event: any, context: TriggerContext): Promise<void> {
  if (!event.commentId) return;
  const comment = await context.reddit.getCommentById(event.commentId);
  if (!isTopLevelComment(comment)) return;

  const subredditId = comment.subredditId;
  const config = await getSubredditConfig(context, subredditId);

  const command = parseTierCommand(comment.body);
  if (command) {
    // Phase 1 scaffold: accept OP/mod/general by config to the degree possible later
    if (
      config.allowGeneralTierCommand ||
      config.allowOpTierCommand ||
      config.allowModTierCommand
    ) {
      await setPostTierState(context, {
        postId: comment.postId,
        requiredTierId: command.tierId,
        updatedBy: comment.authorName,
        updatedAt: Date.now(),
      });
      await appendEnforcementLog(context, subredditId, {
        id: logId(),
        createdAt: Date.now(),
        subredditId,
        postId: comment.postId,
        commentId: comment.id,
        username: comment.authorName,
        action: "tier_command_applied",
        reason: `!tier=${command.tierId}`,
      });
    }
    return;
  }

  const author = await comment.getAuthor();
  if (!author) return;
  const userFlair = await author.getUserFlairBySubreddit(comment.subredditName);
  const parsed = parseFlair(userFlair?.flairText, config.flairFormatRegex);
  const validation = validateParsedFlair(parsed, config);

  const postTier = await getPostTierState(context, comment.postId);
  const requiredTier = getRequiredTierForPost(postTier, config);
  const userTier = parsed?.tierId ?? "3";

  const allowedByTier = validation.valid && isUserAllowedTopLevel(userTier, requiredTier);

  if (!validation.valid || !allowedByTier) {
    const reason = !validation.valid
      ? config.messageTemplates.invalidFlair
      : config.messageTemplates.disallowedTier;

    if (config.enforcementMode === "hard") {
      await comment.remove();
      try {
        await context.modLog.add({
          action: "removecomment",
          target: comment.id,
          details: "flair-wizard",
          description: `Removed by flair-wizard policy (${reason}).`,
        });
      } catch {
        // no-op
      }
    }

    await appendEnforcementLog(context, subredditId, {
      id: logId(),
      createdAt: Date.now(),
      subredditId,
      postId: comment.postId,
      commentId: comment.id,
      username: comment.authorName,
      action: config.enforcementMode === "hard" ? "removed" : "warned",
      reason,
    });
  }
}
