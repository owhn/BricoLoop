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
  console.error(err);
  res.status(500).json({ error: "server: erreur interne" });
}
