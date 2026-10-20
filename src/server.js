import { createApp } from "./app.js";
import { createStore } from "./store.js";
import { seed } from "./seed.js";

const port = Number(process.env.PORT) || 3000;
const app = createApp({ store: createStore(seed) });

app.listen(port, () => {
  console.log(`BricoLoop écoute sur http://localhost:${port}`);
});
