export function createStore(seed = {}) {
  const counters = {};
  const store = {
    users: [...(seed.users ?? [])],
    tools: [...(seed.tools ?? [])],
    loans: [...(seed.loans ?? [])],
    nextId(prefix) {
      counters[prefix] = (counters[prefix] ?? 0) + 1;
      return `${prefix}${counters[prefix]}`;
    },
  };

  // Évite les collisions d'id avec les données du seed (ex. "t8" → prochain "t9").
  for (const list of [store.users, store.tools, store.loans]) {
    for (const { id } of list) {
      const match = /^(\D+)(\d+)$/.exec(id);
      if (match) {
        const [, prefix, n] = match;
        counters[prefix] = Math.max(counters[prefix] ?? 0, Number(n));
      }
    }
  }

  return store;
}
