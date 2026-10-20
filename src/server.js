import { createApp } from "./app.js";
import { createSupabaseClient } from "./supabase.js";
import { createSupabaseStore } from "./supabaseStore.js";

const port = Number(process.env.PORT) || 3000;
const app = createApp({ store: createSupabaseStore(createSupabaseClient()) });

app.listen(port, () => {
  console.log(`BricoLoop écoute sur http://localhost:${port}`);
});
