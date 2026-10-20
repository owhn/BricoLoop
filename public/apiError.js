// Le serveur renvoie { error: "<champ>: <message>" } : on sépare le champ du message.
export function parseApiError(body) {
  const text = typeof body?.error === "string" ? body.error : "";
  const match = /^([^:\s]+):\s*(.*)$/.exec(text);
  if (!match) return { field: null, message: text || "Erreur inattendue" };
  return { field: match[1], message: match[2] };
}
