import { Devvit, type FormField } from "@devvit/public-api";
import { formatFlair, parseFlair, validateParsedFlair } from "./flair.js";
import { getSubredditConfig } from "./storage.js";

const wizardFields: FormField[] = [
  { name: "tierId", label: "Tier ID (e.g. 1, 2a, 2b, 3)", type: "string", defaultValue: "1" },
  { name: "icon", label: "Identity icon (emoji/flag)", type: "string", defaultValue: "🇯🇵" },
  { name: "identity", label: "Identity", type: "string", defaultValue: "Japanese" },
  { name: "freeText", label: "Free text", type: "string", defaultValue: "Kobe -> Romania" },
] as const;

export const flairWizardForm = Devvit.createForm(
  () => ({
    title: "Set Identity Flair",
    fields: wizardFields,
    acceptLabel: "Apply Flair",
  }),
  async ({ values }, context) => {
    const subredditName = context.subredditName;
    if (!subredditName || !context.subredditId) {
      context.ui.showToast("Subreddit context unavailable");
      return;
    }

    const me = await context.reddit.getCurrentUser();
    if (!me) {
      context.ui.showToast("Unable to identify current user");
      return;
    }

    const flairText = formatFlair({
      tierId: String(values.tierId),
      icon: String(values.icon),
      identity: String(values.identity),
      freeText: String(values.freeText),
      flairText: "",
      updatedAt: Date.now(),
    });

    const config = await getSubredditConfig(context, context.subredditId);
    const parsed = parseFlair(flairText, config.flairFormatRegex);
    const validation = validateParsedFlair(parsed, config);
    if (!validation.valid) {
      context.ui.showToast(`Invalid flair: ${validation.reason}`);
      return;
    }

    await context.reddit.setUserFlair({
      subredditName,
      username: me.username,
      text: flairText,
    });

    context.ui.showToast("Flair updated successfully");
  }
);
