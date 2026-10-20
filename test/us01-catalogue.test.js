import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

const fixture = {
  users: [{ id: "u1", firstName: "Bruno", district: "Montpellier" }],
  tools: [
    { id: "t1", ownerId: "u1", name: "Niveau laser", category: "Mesure", description: "", status: "lent" },
    { id: "t2", ownerId: "u1", name: "Perceuse", category: "Perçage", description: "", status: "available" },
    { id: "t3", ownerId: "u1", name: "Taille-haie", category: "Jardinage", description: "", status: "unavailable" },
    { id: "t4", ownerId: "u1", name: "Ponceuse", category: "Autre", description: "", status: "available" },
  ],
  loans: [],
};

describe("US-01 GET /api/tools", () => {
  it("répond 200 avec une liste", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/tools");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("critère 1 : affiche pour chaque outil son nom, sa catégorie et son statut", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/tools");

    expect(res.body).toHaveLength(4);
    for (const tool of res.body) {
      expect(tool).toHaveProperty("name");
      expect(tool).toHaveProperty("category");
      expect(tool).toHaveProperty("status");
    }
  });

  it("critère 2 : les outils disponibles apparaissent en premier", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/tools");

    const statuses = res.body.map((tool) => tool.status);
    expect(statuses.slice(0, 2)).toEqual(["available", "available"]);
    expect(statuses.slice(2)).not.toContain("available");
  });

  it("critère 3 : sans aucun outil, la réponse est une liste vide", async () => {
    const app = createApp({ store: createStore() });

    const res = await request(app).get("/api/tools");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
