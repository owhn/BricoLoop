import { Router } from "express";
import { HttpError } from "../errors.js";

export function toolsActionsRouter(store) {
  const router = Router();

  // PATCH : Modifier un outil
  router.patch("/:id", async (req, res) => {
    const toolId = req.params.id;

    const tool = await store.tools.get(toolId);
    if (!tool) throw new HttpError(404, "Outil introuvable");

    const updatedTool = await store.tools.update(toolId, req.body);
    res.json(updatedTool);
  });

  // DELETE : Supprimer un outil
  router.delete("/:id", async (req, res) => {
    const toolId = req.params.id;

    const tool = await store.tools.get(toolId);
    if (!tool) throw new HttpError(404, "Outil introuvable");

    await store.tools.delete(toolId);
    res.status(204).send();
  });

  return router;
}