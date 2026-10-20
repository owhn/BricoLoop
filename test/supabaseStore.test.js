import { createSupabaseStore } from "../src/supabaseStore.js";

// Faux client Supabase : enregistre les appels et renvoie `result` quand la requête est attendue.
function fakeClient(result = { data: null, error: null }) {
  const calls = [];
  const builder = new Proxy({}, {
    get(_target, method) {
      if (method === "then") return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
      return (...args) => {
        calls.push([method, ...args]);
        return builder;
      };
    },
  });
  return {
    calls,
    from(table) {
      calls.push(["from", table]);
      return builder;
    },
  };
}

const dbTool = { id: 1, owner_id: 2, name: "Perceuse", category: "Perçage", description: null, status: "available" };
const apiTool = { id: "1", ownerId: "2", name: "Perceuse", category: "Perçage", description: null, status: "available" };

describe("createSupabaseStore — correspondance avec la base (snake_case, ids bigint)", () => {
  it("get convertit les colonnes en camelCase et les ids en chaînes", async () => {
    const store = createSupabaseStore(fakeClient({ data: dbTool, error: null }));

    expect(await store.tools.get("1")).toEqual(apiTool);
  });

  it("list convertit chaque ligne", async () => {
    const store = createSupabaseStore(fakeClient({ data: [dbTool], error: null }));

    expect(await store.tools.list()).toEqual([apiTool]);
  });

  it("insert envoie les colonnes en snake_case", async () => {
    const client = fakeClient({ data: dbTool, error: null });
    const store = createSupabaseStore(client);

    const tool = await store.tools.insert({ ownerId: "2", name: "Perceuse", category: "Perçage", description: null, status: "available" });

    expect(client.calls).toContainEqual(["insert", { owner_id: "2", name: "Perceuse", category: "Perçage", description: null, status: "available" }]);
    expect(tool).toEqual(apiTool);
  });

  it("update envoie le patch en snake_case", async () => {
    const client = fakeClient({ data: dbTool, error: null });
    const store = createSupabaseStore(client);

    await store.loans.update("3", { startDate: "2026-11-01" });

    expect(client.calls).toContainEqual(["update", { start_date: "2026-11-01" }]);
  });

  it("id non numérique (ex. X-User-Id: u1) → null sans interroger la base", async () => {
    const client = fakeClient();
    const store = createSupabaseStore(client);

    expect(await store.users.get("u1")).toBeNull();
    expect(await store.tools.update("abc", { status: "lent" })).toBeNull();
    expect(client.calls).toEqual([]);
  });

  it("get d'un id absent → null", async () => {
    const store = createSupabaseStore(fakeClient({ data: null, error: null }));

    expect(await store.users.get("404")).toBeNull();
  });

  it("erreur Supabase → exception avec le nom de la table", async () => {
    const store = createSupabaseStore(fakeClient({ data: null, error: { message: "boom" } }));

    await expect(store.users.list()).rejects.toThrow("supabase users: boom");
  });
});
