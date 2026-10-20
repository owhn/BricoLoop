import { createStore } from "../src/store.js";
import { seed } from "../src/seed.js";

describe("createStore (mémoire)", () => {
  it("sans seed → listes vides", async () => {
    const store = createStore();

    expect(await store.users.list()).toEqual([]);
    expect(await store.tools.list()).toEqual([]);
    expect(await store.loans.list()).toEqual([]);
  });

  it("avec le seed → 4 users et 8 tools", async () => {
    const store = createStore(seed);

    expect(await store.users.list()).toHaveLength(4);
    expect(await store.tools.list()).toHaveLength(8);
  });

  it("get → l'élément, ou null si l'id est inconnu", async () => {
    const store = createStore(seed);

    expect(await store.users.get("u1")).toMatchObject({ id: "u1" });
    expect(await store.users.get("u404")).toBeNull();
  });

  it("insert attribue un id qui ne réutilise pas un id du seed", async () => {
    const store = createStore(seed);

    const tool = await store.tools.insert({ ownerId: "u1", name: "Scie", category: "Autre", status: "available" });

    expect(tool.id).toBe("t9");
    expect(await store.tools.get("t9")).toEqual(tool);
  });

  it("update fusionne le patch, ou renvoie null si l'id est inconnu", async () => {
    const store = createStore(seed);

    expect(await store.tools.update("t1", { status: "lent" })).toMatchObject({ id: "t1", status: "lent" });
    expect(await store.tools.update("t404", { status: "lent" })).toBeNull();
  });

  it("deux stores créés depuis le même seed sont indépendants", async () => {
    const a = createStore(seed);
    const b = createStore(seed);

    await a.tools.update("t1", { status: "lent" });

    expect((await b.tools.get("t1")).status).toBe("available");
    expect(seed.tools[0].status).toBe("available");
  });

  it("les objets renvoyés sont des copies", async () => {
    const store = createStore(seed);

    (await store.tools.get("t1")).status = "lent";

    expect((await store.tools.get("t1")).status).toBe("available");
  });
});
