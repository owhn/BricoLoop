import { HttpError } from "../errors.js";

export const CATEGORIES = ["Perçage", "Jardinage", "Peinture", "Nettoyage", "Mesure", "Autre"];

// US-02 : valide les données du client. Seuls name, category et description sont lus.
export function validateNewTool(body = {}) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 60) {
    throw new HttpError(400, "name: obligatoire, 2 à 60 caractères");
  }

  if (!CATEGORIES.includes(body.category)) {
    throw new HttpError(400, `category: doit être parmi ${CATEGORIES.join(", ")}`);
  }

  const description = body.description ?? null;
  if (description !== null && (typeof description !== "string" || description.length > 300)) {
    throw new HttpError(400, "description: facultative, 300 caractères maximum");
  }

  return { name, category: body.category, description };
}

// Un outil créé appartient à l'utilisateur courant et est disponible.
export function createTool(store, user, body) {
  return store.tools.insert({ ...validateNewTool(body), ownerId: user.id, status: "available", abime: false });
}
