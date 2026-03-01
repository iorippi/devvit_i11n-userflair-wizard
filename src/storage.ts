import type { PostTierState, SubredditConfig, EnforcementLogEntry } from "./types.js";
import { defaultSubredditConfig } from "./config.js";

const MAX_LOG_ENTRIES = 200;

export function configKey(subredditId: string): string {
  return `cfg:${subredditId}`;
}

export function postTierKey(postId: string): string {
  return `postTier:${postId}`;
}

export function logsKey(subredditId: string): string {
  return `logs:${subredditId}`;
}

type Ctx = any;

export async function getSubredditConfig(context: Ctx, subredditId: string): Promise<SubredditConfig> {
  const key = configKey(subredditId);
  const raw = (await context.kvStore?.get(key)) as SubredditConfig | undefined;
  if (!raw) {
    const cfg = defaultSubredditConfig();
    await context.kvStore?.put(key, cfg);
    return cfg;
  }
  return raw;
}

export async function setSubredditConfig(context: Ctx, subredditId: string, config: SubredditConfig): Promise<void> {
  await context.kvStore?.put(configKey(subredditId), config);
}

export async function getPostTierState(context: Ctx, postId: string): Promise<PostTierState | null> {
  const raw = (await context.kvStore?.get(postTierKey(postId))) as PostTierState | undefined;
  return raw ?? null;
}

export async function setPostTierState(context: Ctx, state: PostTierState): Promise<void> {
  await context.kvStore?.put(postTierKey(state.postId), state);
}

export async function appendEnforcementLog(context: Ctx, subredditId: string, entry: EnforcementLogEntry): Promise<void> {
  const key = logsKey(subredditId);
  const prev = ((await context.kvStore?.get(key)) as EnforcementLogEntry[] | undefined) ?? [];
  const next = [entry, ...prev].slice(0, MAX_LOG_ENTRIES);
  await context.kvStore?.put(key, next);
}

export async function getEnforcementLogs(context: Ctx, subredditId: string): Promise<EnforcementLogEntry[]> {
  return ((await context.kvStore?.get(logsKey(subredditId))) as EnforcementLogEntry[] | undefined) ?? [];
}
