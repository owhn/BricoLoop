import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

// Bruno (1) possède la perceuse (1) et la ponceuse (2) ; Alice (2) possède la scie (3).
const fixture = {
  users: [
    { id: "1", firstName: "Bruno", district: "Montpellier" },
    { id: "2", firstName: "Alice", district: "Centre" },
  ],
  tools: [
    { id: "1", ownerId: "1", name: "Perceuse", category: "Perçage", description: "", status: "available" },
    { id: "2", ownerId: "1", name: "Ponceuse", category: "Autre", description: "", status: "available" },
    { id: "3", ownerId: "2", name: "Scie", category: "Autre", description: "", status: "available" },
  ],
  loans: [
    { id: "1", toolId: "1", borrowerId: "2", startDate: "2099-06-10", endDate: "2099-06-12", status: "pending" },
    { id: "2", toolId: "1", borrowerId: "2", startDate: "2099-07-01", endDate: "2099-07-02", status: "pending" },
    { id: "3", toolId: "1", borrowerId: "2", startDate: "2099-05-01", endDate: "2099-05-02", status: "refused" },
    { id: "4", toolId: "3", borrowerId: "1", startDate: "2099-06-10", endDate: "2099-06-12", status: "pending" },
  ],
};

describe("US-12 GET /api/me/tools", () => {
  it("critère : la liste affiche mes outils et, pour chacun, le nombre de demandes en attente", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me/tools").set("X-User-Id", "1");

    expect(res.status).toBe(200);
    expect(res.body.map((tool) => tool.name)).toEqual(["Perceuse", "Ponceuse"]);
    expect(res.body.map((tool) => tool.pendingCount)).toEqual([2, 0]);
    expect(res.body[0].pendingLoanIds).toEqual(["1", "2"]);
  });

  it("je ne vois pas les outils des autres voisins", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me/tools").set("X-User-Id", "2");

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ name: "Scie", pendingCount: 1 });
  });

  it("sans utilisateur, la réponse est 401", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me/tools");

    expect(res.status).toBe(401);
  });

  it("la page contient la section « Mes outils »", async () => {
    const app = createApp({ store: createStore() });

    const res = await request(app).get("/");

    expect(res.text).toContain('id="my-tools"');
  });
});
