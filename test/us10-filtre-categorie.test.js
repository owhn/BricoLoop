import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

const fixture = {
  users: [{ id: "1", firstName: "Alice", district: "Centre" }],
  tools: [
    { id: "1", ownerId: "1", name: "Taille-haie", category: "Jardinage", description: null, status: "lent" },
    { id: "2", ownerId: "1", name: "Perceuse", category: "Perçage", description: null, status: "available" },
    { id: "3", ownerId: "1", name: "Tondeuse", category: "Jardinage", description: null, status: "available" },
    { id: "4", ownerId: "1", name: "Sécateur", category: "Jardinage", description: null, status: "unavailable" },
  ],
};

const get = (query) => request(createApp({ store: createStore(fixture) })).get("/api/tools").query(query);

describe("US-10 — filtrer le catalogue par catégorie (GET /api/tools?category=)", () => {
  describe("le filtre ne renvoie que les outils de la catégorie choisie", () => {
    it("?category=Jardinage → uniquement les outils de jardinage", async () => {
      const res = await get({ category: "Jardinage" });

      expect(res.status).toBe(200);
      expect(res.body.map((t) => t.id).sort()).toEqual(["1", "3", "4"]);
      expect(res.body.every((t) => t.category === "Jardinage")).toBe(true);
    });

    it("garde l'ordre du catalogue (US-01) : disponibles en premier", async () => {
      const res = await get({ category: "Jardinage" });

      expect(res.body[0]).toMatchObject({ id: "3", status: "available" });
    });

    it("catégorie valide sans outil → 200 et liste vide", async () => {
      const res = await get({ category: "Peinture" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("sans paramètre → catalogue complet (US-01 inchangée)", async () => {
      const res = await get({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(4);
    });
  });

  describe("une catégorie inconnue renvoie 400", () => {
    it.each([
      ["hors liste", "Cuisine"],
      ["mauvaise casse", "jardinage"],
      ["sans accent", "Percage"],
      ["vide", ""],
    ])("%s → 400 category", async (_label, category) => {
      const res = await get({ category });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/^category: /);
    });

    it("paramètre répété (?category=A&category=B) → 400 category", async () => {
      const res = await request(createApp({ store: createStore(fixture) })).get(
        "/api/tools?category=Jardinage&category=Mesure",
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/^category: /);
    });
  });
});
