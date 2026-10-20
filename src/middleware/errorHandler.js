import { HttpError } from "../errors.js";

// Express reconnaît un error handler à ses 4 paramètres.
export function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Levée par express.json() sur un body illisible.
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ error: "body: JSON invalide" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "server: erreur interne" });
}
