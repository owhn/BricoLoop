import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

const owner = { id: "1", firstName: "Alice", district: "Centre" };
const tool = {
  id: "2",
  ownerId: owner.id,
  name: "Perceuse",
  category: "Perçage",
  description: "Forets fournis.",
  status: "available",
};

describe("US-03 GET /api/tools/:id", () => {
  it.each(["available", "lent", "unavailable"])(
    "critère 1 : retourne la fiche et le propriétaire pour le statut %s, sans connexion",
    async (status) => {
      const app = createApp({ store: createStore({ users: [owner], tools: [{ ...tool, status }] }) });

      const res = await request(app).get("/api/tools/2");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...tool,
        status,
        owner: { firstName: "Alice", district: "Centre" },
      });
    },
  );

  it("retourne aussi une fiche sans description facultative", async () => {
    const app = createApp({
      store: createStore({ users: [owner], tools: [{ ...tool, description: null }] }),
    });

    const res = await request(app).get("/api/tools/2");

    expect(res.status).toBe(200);
    expect(res.body.description).toBeNull();
  });

  it.each(["999", "inconnu"])("critère 2 : un identifiant inconnu %s renvoie 404", async (id) => {
    const app = createApp({ store: createStore({ users: [owner], tools: [tool] }) });

    const res = await request(app).get(`/api/tools/${id}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "toolId: outil introuvable" });
  });
});
