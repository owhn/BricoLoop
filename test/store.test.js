import { createStore } from "../src/store.js";
import { seed } from "../src/seed.js";

describe("createStore", () => {
  it("sans seed → listes vides", () => {
    const store = createStore();

    expect(store.users).toEqual([]);
    expect(store.tools).toEqual([]);
    expect(store.loans).toEqual([]);
  });

  it("avec le seed → 4 users et 8 tools", () => {
    const store = createStore(seed);

    expect(store.users).toHaveLength(4);
    expect(store.tools).toHaveLength(8);
  });

  it("nextId ne réutilise pas un id du seed", () => {
    const store = createStore(seed);

    expect(store.nextId("t")).toBe("t9");
  });

  it("deux stores créés depuis le même seed sont indépendants", () => {
    const a = createStore(seed);
    const b = createStore(seed);

    a.tools.push({ id: "t99" });

    expect(b.tools).toHaveLength(8);
  });
});
