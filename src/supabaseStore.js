// Store Supabase, utilisé par npm start. Même interface que createStore (src/store.js).
// La base a des colonnes snake_case et des ids bigint ; l'API garde le modèle de CLAUDE.md
// (camelCase, ids en chaînes).
export function createSupabaseStore(client) {
  return {
    users: createCollection(client, "users"),
    tools: createCollection(client, "tools"),
    loans: createCollection(client, "loans"),
  };
}

const ID_FIELDS = new Set(["id", "ownerId", "toolId", "borrowerId"]);

const toCamel = (key) => key.replace(/_([a-z])/g, (_m, c) => c.toUpperCase());
const toSnake = (key) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function fromDb(row) {
  if (!row) return null;
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      const name = toCamel(key);
      return [name, ID_FIELDS.has(name) && value !== null ? String(value) : value];
    }),
  );
}

function toDb(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [toSnake(key), value]));
}

// Un id non numérique ne peut pas exister en base : inutile d'interroger Postgres (qui lèverait une erreur).
const isDbId = (id) => /^\d+$/.test(String(id));

function createCollection(client, table) {
  const run = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(`supabase ${table}: ${error.message}`);
    return data;
  };

  return {
    list: async () => (await run(client.from(table).select("*").order("id"))).map(fromDb),
    get: async (id) => (isDbId(id) ? fromDb(await run(client.from(table).select("*").eq("id", id).maybeSingle())) : null),
    insert: async (data) => fromDb(await run(client.from(table).insert(toDb(data)).select().single())),
    update: async (id, patch) =>
      isDbId(id) ? fromDb(await run(client.from(table).update(toDb(patch)).eq("id", id).select().maybeSingle())) : null,
  };
}
