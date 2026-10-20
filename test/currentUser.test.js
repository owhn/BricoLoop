import express from "express";
import request from "supertest";
import { createStore } from "../src/store.js";
import { currentUser, requireUser } from "../src/middleware/currentUser.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

function buildApp() {
  const store = createStore({ users: [{ id: "u1", firstName: "Alice", district: "Centre" }] });
  const app = express();
  app.use(currentUser(store));
  app.get("/whoami", (req, res) => res.json({ user: req.user }));
  app.get("/private", (req, res) => res.json({ user: requireUser(req) }));
  app.use(errorHandler);
  return app;
}

describe("currentUser", () => {
  it("X-User-Id absent → req.user = null", async () => {
    const res = await request(buildApp()).get("/whoami");

    expect(res.body).toEqual({ user: null });
  });

  it("X-User-Id inconnu → req.user = null", async () => {
    const res = await request(buildApp()).get("/whoami").set("X-User-Id", "u404");

    expect(res.body).toEqual({ user: null });
  });

  it("X-User-Id connu → req.user renseigné", async () => {
    const res = await request(buildApp()).get("/whoami").set("X-User-Id", "u1");

    expect(res.body.user).toMatchObject({ id: "u1", firstName: "Alice" });
  });
});

describe("requireUser", () => {
  it("sans utilisateur → 401 au format d'erreur unique", async () => {
    const res = await request(buildApp()).get("/private");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "X-User-Id: utilisateur requis" });
  });

  it("avec utilisateur → le renvoie", async () => {
    const res = await request(buildApp()).get("/private").set("X-User-Id", "u1");

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe("u1");
  });
});
