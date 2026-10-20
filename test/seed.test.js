import { seed } from "../src/seed.js";

const CATEGORIES = ["Perçage", "Jardinage", "Peinture", "Nettoyage", "Mesure", "Autre"];
const STATUSES = ["available", "lent", "unavailable"];

describe("seed de démo", () => {
  it("4 voisins dans des quartiers différents", () => {
    expect(new Set(seed.users.map((u) => u.district)).size).toBe(4);
  });

  it("8 outils dans au moins 3 catégories valides", () => {
    expect(seed.tools).toHaveLength(8);
    expect(seed.tools.every((t) => CATEGORIES.includes(t.category))).toBe(true);
    expect(new Set(seed.tools.map((t) => t.category)).size).toBeGreaterThanOrEqual(3);
  });

  it("statuts valides, dont au moins un lent et un unavailable", () => {
    const statuses = seed.tools.map((t) => t.status);
    expect(statuses.every((s) => STATUSES.includes(s))).toBe(true);
    expect(statuses).toContain("lent");
    expect(statuses).toContain("unavailable");
  });

  it("chaque outil appartient à un voisin existant", () => {
    const ids = new Set(seed.users.map((u) => u.id));
    expect(seed.tools.every((t) => ids.has(t.ownerId))).toBe(true);
  });
});
