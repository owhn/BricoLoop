import { Router } from "express";

// Factory (store) => Router. Le paramètre store sera déclaré par la première story qui en a besoin.
export function toolsRouter() {
  const router = Router();
  return router;
}
