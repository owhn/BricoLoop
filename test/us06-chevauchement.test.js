import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

// Alice (2) possède la perceuse (1), déjà prêtée à Chloé (3) du 10 au 15. Bruno (1) la demande.
const fixture = {
  users: [
    { id: "1", firstName: "Bruno", district: "Montpellier" },
    { id: "2", firstName: "Alice", district: "Centre" },
    { id: "3", firstName: "Chloé", district: "Port" },
  ],
  tools: [
    { id: "1", ownerId: "2", name: "Perceuse", category: "Perçage", description: "", status: "lent" },
  ],
  loans: [
    { id: "1", toolId: "1", borrowerId: "3", startDate: "2099-06-10", endDate: "2099-06-15", status: "accepted" },
  ],
};

function demander(app, startDate, endDate) {
  return request(app).post("/api/loans").set("X-User-Id", "1").send({ toolId: "1", startDate, endDate });
}

describe("US-06 POST /api/loans : pas de chevauchement avec un prêt accepté", () => {
  it("critère 1 : prêt accepté du 10 au 15, une demande du 12 au 14 est refusée avec 409", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await demander(app, "2099-06-12", "2099-06-14");

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/^startDate:/);
  });

  it("critère 2 : une demande qui commence le lendemain de la fin du prêt est acceptée", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await demander(app, "2099-06-16", "2099-06-18");

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });

  it("une demande seulement « en attente » sur les mêmes dates ne bloque pas (US-04 critère 5)", async () => {
    const store = createStore({
      ...fixture,
      loans: [{ ...fixture.loans[0], status: "pending" }],
    });
    const app = createApp({ store });

    const res = await demander(app, "2099-06-12", "2099-06-14");

    expect(res.status).toBe(201);
  });
});
