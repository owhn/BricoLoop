import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

// US-17 Connexion simple, sans mot de passe : Alice (1) est admin ; Bruno (2) n'a pas encore de rôle en base.
const fixture = {
  users: [
    { id: "1", firstName: "Alice", district: "Centre", role: "admin" },
    { id: "2", firstName: "Bruno", district: "Montpellier" },
  ],
  tools: [],
  loans: [],
};

describe("US-17 Connexion simple : choisir son voisin et voir qui est connecté", () => {
  it("GET /api/users liste tous les voisins avec prénom, quartier et rôle", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: "1", firstName: "Alice", district: "Centre", role: "admin" },
      { id: "2", firstName: "Bruno", district: "Montpellier", role: "user" },
    ]);
  });

  it("GET /api/me renvoie le voisin connecté avec son rôle", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me").set("X-User-Id", "1");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: "1", firstName: "Alice", role: "admin" });
  });

  it("un voisin sans rôle enregistré a le rôle « user » par défaut", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me").set("X-User-Id", "2");

    expect(res.body.role).toBe("user");
  });

  it("sans voisin choisi, l'API répond 401 avec un message en clair", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "X-User-Id: utilisateur requis" });
  });

  it("la page contient la liste déroulante et l'affichage du voisin connecté", async () => {
    const app = createApp({ store: createStore() });

    const res = await request(app).get("/");

    expect(res.text).toContain('<select id="user-id">');
    expect(res.text).toContain('id="connected"');
  });
});
