import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

// Bruno (1) emprunte ; Alice (2) possède la perceuse (1). La ponceuse (2) est à Bruno.
const fixture = {
  users: [
    { id: "1", firstName: "Bruno", district: "Montpellier" },
    { id: "2", firstName: "Alice", district: "Centre" },
  ],
  tools: [
    { id: "1", ownerId: "2", name: "Perceuse", category: "Perçage", description: "", status: "available" },
    { id: "2", ownerId: "1", name: "Ponceuse", category: "Autre", description: "", status: "available" },
  ],
  loans: [],
};

function demander(app, body) {
  return request(app).post("/api/loans").set("X-User-Id", "1").send(body);
}

describe("US-04 POST /api/loans", () => {
  it("critère 1 : un outil disponible demandé avec deux dates crée une demande « en attente »", async () => {
    const store = createStore(fixture);
    const app = createApp({ store });

    const res = await demander(app, { toolId: "1", startDate: "2099-06-10", endDate: "2099-06-14" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      toolId: "1",
      borrowerId: "1",
      startDate: "2099-06-10",
      endDate: "2099-06-14",
      status: "pending",
    });
    expect(await store.loans.list()).toHaveLength(1);
  });

  it("critère 2 : une date de fin antérieure à la date de début renvoie 400", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await demander(app, { toolId: "1", startDate: "2099-06-14", endDate: "2099-06-10" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/^endDate:/);
  });

  it("critère 3 : une date de début antérieure à aujourd'hui renvoie 401", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await demander(app, { toolId: "1", startDate: "2000-01-10", endDate: "2000-01-14" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/^startDate:/);
  });

  it("critère 4 : je ne peux pas demander mon propre outil (400)", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await demander(app, { toolId: "2", startDate: "2099-06-10", endDate: "2099-06-14" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/^toolId:/);
  });

  it("critère 5 : plusieurs demandes en attente peuvent exister pour le même outil", async () => {
    const store = createStore(fixture);
    const app = createApp({ store });

    const premiere = await demander(app, { toolId: "1", startDate: "2099-06-10", endDate: "2099-06-14" });
    const seconde = await demander(app, { toolId: "1", startDate: "2099-06-12", endDate: "2099-06-16" });

    expect(premiere.status).toBe(201);
    expect(seconde.status).toBe(201);
    const enAttente = (await store.loans.list()).filter((loan) => loan.status === "pending");
    expect(enAttente).toHaveLength(2);
  });

  it("un outil inconnu renvoie 404", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await demander(app, { toolId: "99", startDate: "2099-06-10", endDate: "2099-06-14" });

    expect(res.status).toBe(404);
  });
});
