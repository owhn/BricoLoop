import { Router } from "express";
import { HttpError } from "../errors.js";
import { requireUser } from "../middleware/currentUser.js";

// Date du jour au format "AAAA-MM-JJ", comparée comme une chaîne (règle du projet).
const today = () => new Date().toISOString().slice(0, 10);

export function loansRouter(store) {
  const router = Router();

  // US-04 : demander l'emprunt d'un outil pour des dates précises.
  router.post("/", async (req, res) => {
    const user = requireUser(req);
    const { toolId, startDate, endDate } = req.body ?? {};

    if (!toolId) throw new HttpError(400, "toolId: obligatoire");
    if (!startDate) throw new HttpError(400, "startDate: obligatoire");
    if (!endDate) throw new HttpError(400, "endDate: obligatoire");

    const tool = await store.tools.get(String(toolId));
    if (!tool) throw new HttpError(404, "toolId: outil introuvable");
    if (tool.ownerId === user.id) throw new HttpError(400, "toolId: impossible d'emprunter son propre outil");
    if (endDate < startDate) throw new HttpError(400, "endDate: antérieure à la date de début");
    // Règle ajoutée par l'équipe sur la carte Trello (401) : à confirmer par le PO.
    if (startDate < today()) throw new HttpError(401, "startDate: date de début déjà passée");

    // US-06 : refuse une demande qui chevauche un prêt déjà accepté pour cet outil.
    const loans = await store.loans.list();
    const overlaps = loans.some(
      (other) =>
        other.toolId === tool.id &&
        other.status === "accepted" &&
        other.startDate <= endDate &&
        startDate <= other.endDate,
    );
    if (overlaps) throw new HttpError(409, "startDate: l'outil est déjà prêté sur ces dates");

    const loan = await store.loans.insert({
      toolId: tool.id,
      borrowerId: user.id,
      startDate,
      endDate,
      status: "pending",
    });
    res.status(201).json(loan);
  });

  // US-05 : le propriétaire accepte ou refuse une demande.
  router.patch("/:id", async (req, res) => {
    const user = requireUser(req);
    const { status } = req.body ?? {};

    if (status !== "accepted" && status !== "refused") {
      throw new HttpError(400, "status: accepted ou refused attendu");
    }

    const loan = await store.loans.get(req.params.id);
    if (!loan) throw new HttpError(404, "loan: demande introuvable");

    const tool = await store.tools.get(loan.toolId);
    if (!tool || tool.ownerId !== user.id) {
      throw new HttpError(403, "loan: seul le propriétaire de l'outil peut répondre");
    }
    if (loan.status !== "pending") throw new HttpError(409, "status: la demande n'est plus en attente");

    const updated = await store.loans.update(loan.id, { status });
    if (status === "accepted") await store.tools.update(tool.id, { status: "lent" });
    res.json(updated);
  });

  return router;
}
