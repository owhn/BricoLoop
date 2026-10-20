import { Router } from "express";
import { HttpError } from "../errors.js";
import { requireUser } from "../middleware/currentUser.js";

export function returnsRouter(store) {
  const router = Router();

  // US-07 : Déclarer le retour d'un outil
  router.patch("/:id/return", async (req, res) => {
    const user = requireUser(req);
    const loanId = req.params.id;

    // Récupérer le prêt
    const loan = await store.loans.get(loanId);
    if (!loan) throw new HttpError(404, "Prêt introuvable");

    // Récupérer l'outil associé
    const tool = await store.tools.get(loan.toolId);
    if (!tool) throw new HttpError(404, "Outil introuvable");

    // Seul le propriétaire peut déclarer le retour (403 sinon)
    if (tool.ownerId !== user.id) {
      throw new HttpError(403, "Seul le propriétaire peut déclarer le retour de cet outil");
    }

    // Mise à jour : le prêt passe "returned" et l'outil redevient "available"
    const updatedLoan = await store.loans.update(loanId, { status: "returned" });
    await store.tools.update(tool.id, { status: "available" });

    res.json(updatedLoan);
  });

  return router;
}