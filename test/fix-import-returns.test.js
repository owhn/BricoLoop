import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

// Non-régression : app.js importait ./routes/returns.js alors que le fichier s'appelait return.js.
describe("fix : l'application démarre avec la route de retour US-07", () => {
  it("la route PATCH /api/returns/:id/return existe (401 sans utilisateur)", async () => {
    const app = createApp({ store: createStore() });

    const res = await request(app).patch("/api/returns/1/return");

    expect(res.status).toBe(401);
  });
});
