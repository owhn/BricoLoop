import { Router } from "express";
import { requireUser } from "../middleware/currentUser.js";

export function meRouter(store) {
  const router = Router();

  // US-17 Connexion simple : le voisin connecté (X-User-Id) et son rôle ; 401 si personne n'est choisi.
  router.get("/", (req, res) => {
    const user = requireUser(req);
    res.json({ ...user, role: user.role ?? "user" });
  });

  // US-08 : mes demandes et mes emprunts, triés par date de début.
  router.get("/loans", async (req, res) => {
    const user = requireUser(req);
    const loans = await store.loans.list();
    const mine = loans
      .filter((loan) => loan.borrowerId === user.id)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    res.json(mine);
  });

  return router;
}
