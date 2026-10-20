import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

// Bruno (1) a trois demandes, dans le désordre ; Alice (2) en a une.
const fixture = {
  users: [
    { id: "1", firstName: "Bruno", district: "Montpellier" },
    { id: "2", firstName: "Alice", district: "Centre" },
  ],
  tools: [
    { id: "1", ownerId: "2", name: "Perceuse", category: "Perçage", description: "", status: "lent" },
    { id: "2", ownerId: "1", name: "Ponceuse", category: "Autre", description: "", status: "lent" },
  ],
  loans: [
    { id: "1", toolId: "1", borrowerId: "1", startDate: "2099-08-01", endDate: "2099-08-03", status: "pending" },
    { id: "2", toolId: "2", borrowerId: "2", startDate: "2099-06-01", endDate: "2099-06-05", status: "accepted" },
    { id: "3", toolId: "1", borrowerId: "1", startDate: "2099-06-15", endDate: "2099-06-20", status: "accepted" },
    { id: "4", toolId: "1", borrowerId: "1", startDate: "2099-07-01", endDate: "2099-07-02", status: "refused" },
  ],
};

describe("US-08 GET /api/me/loans", () => {
  it("critère 1 : la liste contient mes demandes avec leur statut, triées par date de début", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me/loans").set("X-User-Id", "1");

    expect(res.status).toBe(200);
    expect(res.body.map((loan) => loan.startDate)).toEqual(["2099-06-15", "2099-07-01", "2099-08-01"]);
    expect(res.body.map((loan) => loan.status)).toEqual(["accepted", "refused", "pending"]);
  });

  it("critère 2 : je ne vois que les miennes", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me/loans").set("X-User-Id", "2");

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: "2", borrowerId: "2" });
  });

  it("sans utilisateur (X-User-Id absent), la réponse est 401", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await request(app).get("/api/me/loans");

    expect(res.status).toBe(401);
  });
});
