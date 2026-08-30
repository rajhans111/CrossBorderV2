import type { Notifier } from "../interfaces/notifier.js";

export const consoleNotifier: Notifier = {
  notify(message) {
    console.log(`[notify] ${message}`);
  },
};
