import { Router } from "express";
import { requireUser } from "../middleware/currentUser.js";
import { createTool } from "../services/tools.js";

export function toolsRouter(store) {
  const router = Router();

  router.post("/", async (req, res) => {
    const user = requireUser(req);
    const tool = await createTool(store, user, req.body);
    res.status(201).json(tool);
  });

  return router;
}
