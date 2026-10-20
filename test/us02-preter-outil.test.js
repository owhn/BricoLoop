import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

const fixture = {
  users: [{ id: "u1", firstName: "Alice", district: "Centre" }],
};

function setup() {
  const store = createStore(fixture);
  const app = createApp({ store });
  const post = (body) => request(app).post("/api/tools").set("X-User-Id", "u1").send(body);
  return { store, app, post };
}

const valid = { name: "Perceuse", category: "Perçage", description: "Sans fil 18 V" };

describe("US-02 — prêter un outil (POST /api/tools)", () => {
  describe("création", () => {
    it("201 avec l'outil créé, enregistré dans le store", async () => {
      const { store, post } = setup();

      const res = await post(valid);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(valid);
      expect(res.body.id).toEqual(expect.any(String));
      expect(await store.tools.get(res.body.id)).toEqual(res.body);
    });

    it("appartient à l'utilisateur courant et a le statut available", async () => {
      const { post } = setup();

      const res = await post(valid);

      expect(res.body.ownerId).toBe("u1");
      expect(res.body.status).toBe("available");
    });

    it("ignore status, ownerId et id envoyés par le client", async () => {
      const { post } = setup();

      const res = await post({ ...valid, status: "lent", ownerId: "u2", id: "t42" });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("available");
      expect(res.body.ownerId).toBe("u1");
      expect(res.body.id).not.toBe("t42");
    });
  });

  describe("utilisateur courant", () => {
    it("X-User-Id absent → 401", async () => {
      const { app, store } = setup();

      const res = await request(app).post("/api/tools").send(valid);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "X-User-Id: utilisateur requis" });
      expect(await store.tools.list()).toEqual([]);
    });

    it("X-User-Id inconnu → 401", async () => {
      const { app } = setup();

      const res = await request(app).post("/api/tools").set("X-User-Id", "u404").send(valid);

      expect(res.status).toBe(401);
    });
  });

  describe("nom obligatoire, 2 à 60 caractères", () => {
    it.each([
      ["absent", undefined],
      ["vide", ""],
      ["que des espaces", "     "],
      ["1 caractère après trim", " a "],
      ["61 caractères", "a".repeat(61)],
      ["pas une chaîne", 42],
    ])("%s → 400 name", async (_label, name) => {
      const { post, store } = setup();

      const res = await post({ ...valid, name });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/^name: /);
      expect(await store.tools.list()).toEqual([]);
    });

    it.each([
      ["2 caractères", "ab"],
      ["60 caractères", "a".repeat(60)],
    ])("%s → accepté", async (_label, name) => {
      const { post } = setup();

      const res = await post({ ...valid, name });

      expect(res.status).toBe(201);
    });

    it("est stocké sans les espaces autour", async () => {
      const { post } = setup();

      const res = await post({ ...valid, name: "  Scie sauteuse  " });

      expect(res.body.name).toBe("Scie sauteuse");
    });
  });

  describe("catégorie dans la liste autorisée", () => {
    it.each(["Perçage", "Jardinage", "Peinture", "Nettoyage", "Mesure", "Autre"])("%s → acceptée", async (category) => {
      const { post } = setup();

      const res = await post({ ...valid, category });

      expect(res.status).toBe(201);
      expect(res.body.category).toBe(category);
    });

    it.each([
      ["absente", undefined],
      ["hors liste", "Cuisine"],
      ["mauvaise casse", "jardinage"],
      ["sans accent", "Percage"],
    ])("%s → 400 category", async (_label, category) => {
      const { post } = setup();

      const res = await post({ ...valid, category });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/^category: /);
    });
  });

  describe("description facultative, 300 caractères maximum", () => {
    it("absente → acceptée, stockée null", async () => {
      const { post } = setup();

      const res = await post({ name: "Perceuse", category: "Perçage" });

      expect(res.status).toBe(201);
      expect(res.body.description).toBeNull();
    });

    it("300 caractères → acceptée", async () => {
      const { post } = setup();

      const res = await post({ ...valid, description: "a".repeat(300) });

      expect(res.status).toBe(201);
    });

    it.each([
      ["301 caractères", "a".repeat(301)],
      ["pas une chaîne", 12],
    ])("%s → 400 description", async (_label, description) => {
      const { post } = setup();

      const res = await post({ ...valid, description });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/^description: /);
    });
  });

  describe("body invalide", () => {
    it("body absent → 400 name", async () => {
      const { app } = setup();

      const res = await request(app).post("/api/tools").set("X-User-Id", "u1");

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/^name: /);
    });

    it("JSON mal formé → 400 body", async () => {
      const { app } = setup();

      const res = await request(app)
        .post("/api/tools")
        .set("X-User-Id", "u1")
        .set("Content-Type", "application/json")
        .send("{ pas du json");

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/^body: /);
    });
  });
});
