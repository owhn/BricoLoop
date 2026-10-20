import { Router } from "express";

// Factory (store) => Router. Le paramètre store sera déclaré par la première story qui en a besoin.
export function meRouter() {
  const router = Router();
  return router;
}
