import { Devvit } from "@devvit/public-api";
import { handleCommentCreate, handlePostCreate } from "./enforcement.js";
import { modConfigForm } from "./modSettings.js";
import { flairWizardForm } from "./wizard.js";
import { showDashboard } from "./dashboard.js";

Devvit.configure({
  redditAPI: true,
  kvStore: true,
});

Devvit.addMenuItem({
  label: "Set identity flair",
  description: "Open the flair wizard",
  location: "subreddit",
  forUserType: "loggedOut",
  onPress: (_, context) => {
    context.ui.showForm(flairWizardForm);
  },
});

Devvit.addMenuItem({
  label: "Configure flair-tier policy",
  description: "Moderator settings for tier enforcement",
  location: "subreddit",
  forUserType: "moderator",
  onPress: (_, context) => {
    context.ui.showForm(modConfigForm);
  },
});

Devvit.addMenuItem({
  label: "Flair enforcement dashboard",
  description: "View latest policy enforcement log summary",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_, context) => {
    await showDashboard(context);
  },
});

Devvit.addTrigger({
  event: "PostCreate",
  onEvent: async (event, context) => {
    await handlePostCreate(event, context);
  },
});

Devvit.addTrigger({
  event: "CommentCreate",
  onEvent: async (event, context) => {
    await handleCommentCreate(event, context);
  },
});

export default Devvit;
