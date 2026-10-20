import path from "node:path";
import express from "express";
import { currentUser } from "./middleware/currentUser.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { toolsRouter } from "./routes/tools.js";
import { loansRouter } from "./routes/loans.js";
import { meRouter } from "./routes/me.js";
import { returnsRouter } from "./routes/returns.js";
import { usersRouter } from "./routes/users.js";

export function createApp({ store }) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(import.meta.dirname, "..", "public")));

  // Avant currentUser : /health ne doit pas dépendre de la base.
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(currentUser(store));

  app.use("/api/tools", toolsRouter(store));
  app.use("/api/loans", loansRouter(store));
  app.use("/api/me", meRouter(store));
  app.use("/api/returns", returnsRouter(store));
  app.use("/api/users", usersRouter(store));

  app.use(errorHandler);
  return app;
}
