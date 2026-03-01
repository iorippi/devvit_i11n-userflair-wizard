import { Devvit, type FormField } from "@devvit/public-api";
import { defaultSubredditConfig } from "./config.js";
import { getSubredditConfig, setSubredditConfig } from "./storage.js";
import type { SubredditConfig } from "./types.js";

const normalizeEnforcementMode = (
  value: unknown
): SubredditConfig["enforcementMode"] => {
  return value === "hard" ? "hard" : "warn";
};

const configFields: FormField[] = [
  { name: "enforcementMode", label: "Enforcement mode (warn|hard)", type: "string", defaultValue: "warn" },
  { name: "defaultPostTier", label: "Default post tier", type: "string", defaultValue: "1" },
  { name: "allowGeneralTierCommand", label: "Allow tier command from any user", type: "boolean", defaultValue: false },
  { name: "allowOpTierCommand", label: "Allow tier command from OP", type: "boolean", defaultValue: true },
  { name: "allowModTierCommand", label: "Allow tier command from mods", type: "boolean", defaultValue: true },
  { name: "gracePeriodDays", label: "Grace period days", type: "number", defaultValue: 30 },
] as const;

export const modConfigForm = Devvit.createForm(
  () => ({
    title: "Configure Flair Tier Policy",
    fields: configFields,
    acceptLabel: "Save",
  }),
  async ({ values }, context) => {
    if (!context.subredditId) return;

    const existing = await getSubredditConfig(context, context.subredditId);
    const merged: SubredditConfig = {
      ...defaultSubredditConfig(),
      ...existing,
      enforcementMode: normalizeEnforcementMode(values.enforcementMode),
      defaultPostTier: String(values.defaultPostTier || "1"),
      allowGeneralTierCommand: Boolean(values.allowGeneralTierCommand),
      allowOpTierCommand: Boolean(values.allowOpTierCommand),
      allowModTierCommand: Boolean(values.allowModTierCommand),
      gracePeriodDays: Number(values.gracePeriodDays || 30),
    };

    await setSubredditConfig(context, context.subredditId, merged);
    context.ui.showToast("Flair tier config saved");
  }
);
