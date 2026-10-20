// Store en mémoire, utilisé par les tests. Même interface que createSupabaseStore :
// store.{users,tools,loans}.{list(), get(id), insert(data), update(id, patch)}, toutes async.
export function createStore(seed = {}) {
  return {
    users: createCollection("u", seed.users),
    tools: createCollection("t", seed.tools),
    loans: createCollection("l", seed.loans),
  };
}

function createCollection(prefix, initial = []) {
  const items = structuredClone(initial);
  // Évite les collisions d'id avec les données du seed (ex. "t8" → prochain "t9").
  let counter = Math.max(0, ...items.map(({ id }) => Number(/^\D+(\d+)$/.exec(id)?.[1] ?? 0)));

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
      const item = { ...structuredClone(data), id: `${prefix}${counter}` };
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
