import { getEnforcementLogs } from "./storage.js";

export async function showDashboard(context: any): Promise<void> {
  if (!context.subredditId) {
    context.ui.showToast("Subreddit context unavailable");
    return;
  }

  const logs = await getEnforcementLogs(context, context.subredditId);
  const latest = logs[0];
  if (!latest) {
    context.ui.showToast("No enforcement logs yet");
    return;
  }

  context.ui.showToast(
    `Logs: ${logs.length} | Latest: ${latest.action} by ${latest.username ?? "unknown"}`
  );
}
