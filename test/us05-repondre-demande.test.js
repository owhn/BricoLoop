import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

// Bruno (1) possède la perceuse (1). Alice (2) l'a demandée : demande 1 en attente, demande 2 déjà refusée.
const fixture = {
  users: [
    { id: "1", firstName: "Bruno", district: "Montpellier" },
    { id: "2", firstName: "Alice", district: "Centre" },
  ],
  tools: [
    { id: "1", ownerId: "1", name: "Perceuse", category: "Perçage", description: "", status: "available" },
  ],
  loans: [
    { id: "1", toolId: "1", borrowerId: "2", startDate: "2099-06-10", endDate: "2099-06-14", status: "pending" },
    { id: "2", toolId: "1", borrowerId: "2", startDate: "2099-07-01", endDate: "2099-07-03", status: "refused" },
  ],
};

function repondre(app, userId, loanId, status) {
  return request(app).patch(`/api/loans/${loanId}`).set("X-User-Id", userId).send({ status });
}

describe("US-05 PATCH /api/loans/:id", () => {
  it("critère 1 : seul le propriétaire de l'outil peut répondre, sinon 403", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await repondre(app, "2", "1", "accepted");

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/^loan:/);
  });

  it("critère 2 : une demande acceptée passe « acceptée » et l'outil passe « prêté »", async () => {
    const store = createStore(fixture);
    const app = createApp({ store });

    const res = await repondre(app, "1", "1", "accepted");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("accepted");
    expect((await store.tools.get("1")).status).toBe("lent");
  });

  it("critère 3 : une demande refusée passe « refusée » et l'outil ne change pas", async () => {
    const store = createStore(fixture);
    const app = createApp({ store });

    const res = await repondre(app, "1", "1", "refused");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("refused");
    expect((await store.tools.get("1")).status).toBe("available");
  });

  it("critère 4 : on ne peut répondre qu'à une demande « en attente », sinon 409", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await repondre(app, "1", "2", "accepted");

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/^status:/);
  });

  it("une réponse autre que accepted ou refused renvoie 400", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await repondre(app, "1", "1", "returned");

    expect(res.status).toBe(400);
  });

  it("une demande inconnue renvoie 404", async () => {
    const app = createApp({ store: createStore(fixture) });

    const res = await repondre(app, "1", "99", "accepted");

    expect(res.status).toBe(404);
  });
});
