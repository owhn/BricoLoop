// Store en mémoire, utilisé par les tests. Même interface que createSupabaseStore :
// store.{users,tools,loans}.{list(), get(id), insert(data), update(id, patch)}, toutes async.
export function createStore(seed = {}) {
  return {
    users: createCollection(seed.users),
    tools: createCollection(seed.tools),
    loans: createCollection(seed.loans),
  };
}

// Ids numériques en chaînes ("1", "2"…), comme ceux renvoyés par le store Supabase.
function createCollection(initial = []) {
  const items = structuredClone(initial);
  // Évite les collisions d'id avec les données du seed (ex. "8" → prochain "9").
  let counter = Math.max(0, ...items.map(({ id }) => (/^\d+$/.test(id) ? Number(id) : 0)));

  return {
    async list() {
      return structuredClone(items);
    },
    async get(id) {
      const item = items.find((i) => i.id === id);
      return item ? structuredClone(item) : null;
    },
    async insert(data) {
      counter += 1;
      const item = { ...structuredClone(data), id: String(counter) };
      items.push(item);
      return structuredClone(item);
    },
    async update(id, patch) {
      const item = items.find((i) => i.id === id);
      if (!item) return null;
      Object.assign(item, structuredClone(patch), { id });
      return structuredClone(item);
    },
  };
}
