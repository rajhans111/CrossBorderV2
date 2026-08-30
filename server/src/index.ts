import { createApp } from "./app.js";
import { resetStore, store } from "./store/singleton.js";

resetStore();

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

app.listen(port, () => {
  console.log(`[setu-server] listening on http://localhost:${port}`);
  console.log(
    `[setu-server] seeded ${store.getAllOrders().length} orders, ${store.getAuditTrail().length} audit events`,
  );
});
