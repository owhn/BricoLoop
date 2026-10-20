import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";
import { parseApiError } from "../public/apiError.js";

function setup(status = "accepted") {
  const store = createStore({
    users: ["1", "2", "3"].map((id) => ({ id, firstName: `Voisin ${id}`, district: "Centre" })),
    tools: [{ id: "1", ownerId: "1", name: "Perceuse", category: "Perçage", status: "lent", abime: false }],
    loans: [{ id: "1", toolId: "1", borrowerId: "2", status }],
  });
  const app = createApp({ store });
  const report = (userId, id = "1") => {
    const req = request(app).patch(`/api/tools/${id}/abime`);
    return userId ? req.set("X-User-Id", userId) : req;
  };
  return { store, app, report };
}

describe("US-15 — signaler un outil abîmé", () => {
  it("affiche un formulaire avec une zone de message accessible dans la fiche", async () => {
    const { app } = setup();
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="damage-form"');
    expect(res.text).toContain("Signaler cet outil abîmé");
    expect(res.text).toContain('aria-live="polite"');
  });
  it.each(["1", "2"])("autorise le propriétaire ou l'emprunteur (%s) et conserve le statut", async (id) => {
    const { store, app, report } = setup();
    const before = await store.tools.get("1");
    const res = await report(id);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...before, abime: true });
    expect(await store.tools.get("1")).toEqual(res.body);
    expect((await request(app).get("/api/tools/1")).body.abime).toBe(true);
    expect((await request(app).get("/api/tools")).body[0].abime).toBe(true);
  });

  it("un signalement répété est sans effet supplémentaire", async () => {
    const { report } = setup();
    expect((await report("1")).status).toBe(200);
    expect((await report("1")).body.abime).toBe(true);
  });

  it.each(["pending", "refused", "returned"])("refuse un demandeur dont le prêt est %s", async (status) => {
    const { report, store } = setup(status);
    const res = await report("2");
    expect(res.status).toBe(403);
    expect(parseApiError(res.body).message).toContain("seul le propriétaire ou l'emprunteur");
    expect((await store.tools.get("1")).abime).toBe(false);
  });

  it("refuse un autre voisin avec une erreur lisible", async () => {
    const { report } = setup();
    const res = await report("3");
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/^abime: /);
  });

  it("exige un utilisateur", async () => {
    const { report } = setup();
    const res = await report();
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("X-User-Id: utilisateur requis");
  });

  it("renvoie 404 pour un outil inconnu", async () => {
    const { report } = setup();
    const res = await report("1", "999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("toolId: outil introuvable");
  });

  it("un nouvel outil est non abîmé même si le client indique le contraire", async () => {
    const { app } = setup();
    const res = await request(app).post("/api/tools").set("X-User-Id", "1")
      .send({ name: "Scie", category: "Autre", abime: true });
    expect(res.status).toBe(201);
    expect(res.body.abime).toBe(false);
  });
});
