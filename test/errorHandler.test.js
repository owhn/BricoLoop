import express from "express";
import request from "supertest";
import { HttpError } from "../src/errors.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

function buildApp(err) {
  const app = express();
  app.get("/boom", () => {
    throw err;
  });
  app.use(errorHandler);
  return app;
}

describe("errorHandler", () => {
  it("HttpError → son status et { error }", async () => {
    const res = await request(buildApp(new HttpError(404, "id: outil introuvable"))).get("/boom");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "id: outil introuvable" });
  });

  it("autre erreur → 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(buildApp(new Error("oups"))).get("/boom");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "server: erreur interne" });
  });
});
