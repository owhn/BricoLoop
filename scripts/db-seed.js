// Charge les données de démo (src/seed.js) dans Supabase.
// upsert : relançable sans doublon, remet les lignes du seed à leur état initial, ne touche pas aux autres lignes.
import { createSupabaseClient } from "../src/supabase.js";
import { seed } from "../src/seed.js";

const client = createSupabaseClient();

for (const table of ["users", "tools", "loans"]) {
  if (seed[table].length === 0) continue;
  const { error } = await client.from(table).upsert(seed[table]);
  if (error) {
    console.error(`${table}: ${error.message}`);
    process.exit(1);
  }
  console.log(`${table}: ${seed[table].length} ligne(s)`);
}
