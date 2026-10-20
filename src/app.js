import path from "node:path";
import express from "express";
import { currentUser } from "./middleware/currentUser.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { toolsRouter } from "./routes/tools.js";
import { loansRouter } from "./routes/loans.js";
import { meRouter } from "./routes/me.js";
import { returnsRouter } from "./routes/returns.js";
<<<<<<< HEAD
import { toolActionsRouter } from "./routes/toolActions.js"; // 1. Ton import
=======
>>>>>>> 99733c33df49ec7672877bf57a1850c525281210

export function createApp({ store }) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(import.meta.dirname, "..", "public")));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(currentUser(store));

  app.use("/api/tools", toolsRouter(store));
  app.use("/api/loans", loansRouter(store));
  app.use("/api/me", meRouter(store));
  app.use("/api/returns", returnsRouter(store));
  app.use("/api/tool-actions", toolActionsRouter(store)); // 2. Ta route dédiée

  app.use(errorHandler);
  return app;
}
