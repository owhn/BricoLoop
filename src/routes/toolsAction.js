import { Router } from "express";
import { HttpError } from "../errors.js";

export function toolActionsRouter(store) {
  const router = Router();

  // PATCH : Modifier un outil via un nouveau fichier de route
  router.patch("/:id", async (req, res) => {
    const toolId = req.params.id;

    // Vérifier si l'outil existe
    const tool = await store.tools.get(toolId);
    if (!tool) throw new HttpError(404, "Outil introuvable");

    // Mise à jour
    const updatedTool = await store.tools.update(toolId, req.body);
    res.json(updatedTool);
  });

  // DELETE : Supprimer un outil via un nouveau fichier de route
  router.delete("/:id", async (req, res) => {
    const toolId = req.params.id;

    // Vérifier si l'outil existe
    const tool = await store.tools.get(toolId);
    if (!tool) throw new HttpError(404, "Outil introuvable");

    // Suppression
    await store.tools.delete(toolId);
    res.status(204).send();
  });

  return router;
}