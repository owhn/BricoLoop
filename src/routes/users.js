import { Router } from "express";

// US-17 Connexion simple (sans mot de passe) : la liste des voisins, pour choisir qui on est.
export function usersRouter(store) {
  const router = Router();

  router.get("/", async (_req, res) => {
    const users = await store.users.list();
    res.json(users.map((user) => ({ ...user, role: user.role ?? "user" })));
  });

  return router;
}
