import { Store } from "./store.js";
import { loadSeed } from "./seed.js";

export const store = new Store();

export function resetStore(): void {
  store.clear();
  loadSeed(store);
}
