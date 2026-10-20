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

  // US-12 : mes outils et, pour chacun, le nombre de demandes en attente (avec leurs numéros).
  router.get("/tools", async (req, res) => {
    const user = requireUser(req);
    const [tools, loans] = await Promise.all([store.tools.list(), store.loans.list()]);
    const mine = tools
      .filter((tool) => tool.ownerId === user.id)
      .map((tool) => {
        const pending = loans.filter((loan) => loan.toolId === tool.id && loan.status === "pending");
        return { ...tool, pendingCount: pending.length, pendingLoanIds: pending.map((loan) => loan.id) };
      });
    res.json(mine);
  });

  return router;
}
