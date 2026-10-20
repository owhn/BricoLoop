import { Router } from "express";
import { HttpError } from "../errors.js";
import { requireUser } from "../middleware/currentUser.js";
import { createTool } from "../services/tools.js";

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

  // US-02 : prêter un outil.
  router.post("/", async (req, res) => {
    const user = requireUser(req);
    const tool = await createTool(store, user, req.body);
    res.status(201).json(tool);
  });

  // US-03 : fiche d'un outil et informations publiques du propriétaire.
  router.get("/:id", async (req, res) => {
    const tool = await store.tools.get(req.params.id);
    if (!tool) throw new HttpError(404, "toolId: outil introuvable");

    const owner = await store.users.get(tool.ownerId);
    res.json({
      ...tool,
      owner: owner ? { firstName: owner.firstName, district: owner.district } : null,
    });
  });

  return router;
}
