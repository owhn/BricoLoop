import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";
import { CATEGORIES } from "../src/services/tools.js";
import { parseApiError } from "../public/apiError.js";

describe("interface (public/)", () => {
  it("GET / sert la page avec le catalogue et le formulaire", async () => {
    const app = createApp({ store: createStore() });

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toContain('id="catalogue"');
    expect(res.text).toContain('id="lend-form"');
  });

  it.each([
    ["US-03 fiche outil", 'id="tool-dialog"'],
    ["US-04 demande d'emprunt", 'id="borrow-form"'],
    ["US-05 répondre à une demande", 'id="respond-form"'],
    ["US-08 mes emprunts", 'id="my-loans"'],
  ])("la page contient l'écran %s", async (_story, marker) => {
    const app = createApp({ store: createStore() });

    const res = await request(app).get("/");

    expect(res.text).toContain(marker);
  });

  it("le formulaire propose exactement les catégories de l'API", async () => {
    const app = createApp({ store: createStore() });

    const res = await request(app).get("/");
    const options = [...res.text.matchAll(/<option>([^<]+)<\/option>/g)].map((m) => m[1]);

    expect(options).toEqual(CATEGORIES);
  });

  it.each(["app.js", "apiError.js", "style.css"])("sert %s", async (file) => {
    const app = createApp({ store: createStore() });

    const res = await request(app).get(`/${file}`);

    expect(res.status).toBe(200);
  });
});

describe("parseApiError", () => {
  it("sépare le champ du message", () => {
    expect(parseApiError({ error: "name: obligatoire, 2 à 60 caractères" })).toEqual({
      field: "name",
      message: "obligatoire, 2 à 60 caractères",
    });
  });

  it("garde un champ contenant des tirets (X-User-Id)", () => {
    expect(parseApiError({ error: "X-User-Id: utilisateur requis" })).toEqual({
      field: "X-User-Id",
      message: "utilisateur requis",
    });
  });

  it("message sans champ → field null", () => {
    expect(parseApiError({ error: "oups" })).toEqual({ field: null, message: "oups" });
  });

  it("body inattendu → message générique", () => {
    expect(parseApiError(null)).toEqual({ field: null, message: "Erreur inattendue" });
  });
});
