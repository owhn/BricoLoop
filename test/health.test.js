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

describe("GET /health sans dépendance au store", () => {
  it("répond 200 même avec X-User-Id quand le store est en panne", async () => {
    const store = createStore();
    store.users.get = async () => {
      throw new Error("base injoignable");
    };
    const app = createApp({ store });

    const res = await request(app).get("/health").set("X-User-Id", "u1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
