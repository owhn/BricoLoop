import request from "supertest";
import { createApp } from "../src/app.js";
import { createStore } from "../src/store.js";

describe("GET /health", () => {
  it("répond 200 { status: \"ok\" }", async () => {
    const app = createApp({ store: createStore() });

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
