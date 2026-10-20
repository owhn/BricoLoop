import { HttpError } from "../errors.js";

// X-User-Id absent ou inconnu → req.user = null (pas d'erreur ici).
export function currentUser(store) {
  return (req, _res, next) => {
    const id = req.get("X-User-Id");
    req.user = (id && store.users.find((u) => u.id === id)) || null;
    next();
  };
}

// TODO PO : règle provisoire à valider — utilisateur absent ou inconnu → 401.
export function requireUser(req) {
  if (!req.user) {
    throw new HttpError(401, "X-User-Id: utilisateur requis");
  }
  return req.user;
}
