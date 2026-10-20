// Store Supabase, utilisé par npm start. Même interface que createStore (src/store.js).
export function createSupabaseStore(client) {
  return {
    users: createCollection(client, "users"),
    tools: createCollection(client, "tools"),
    loans: createCollection(client, "loans"),
  };
}

function createCollection(client, table) {
  const run = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(`supabase ${table}: ${error.message}`);
    return data;
  };

  return {
    list: () => run(client.from(table).select("*").order("id")),
    get: (id) => run(client.from(table).select("*").eq("id", id).maybeSingle()),
    insert: (data) => run(client.from(table).insert(data).select().single()),
    update: (id, patch) => run(client.from(table).update(patch).eq("id", id).select().maybeSingle()),
  };
}
