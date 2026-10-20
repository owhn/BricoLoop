import { Router } from "express";

// US-01 : les outils disponibles passent avant les autres.
const rank = (tool) => (tool.status === "available" ? 0 : 1);

export function toolsRouter(store) {
  const router = Router();

  // US-01 : catalogue des outils, disponibles en premier.
  router.get("/", async (_req, res) => {
    const tools = await store.tools.list();
    tools.sort((a, b) => rank(a) - rank(b));
    res.json(tools);
  });

  return router;
}
