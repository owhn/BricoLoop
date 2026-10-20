import { HttpError } from "../errors.js";

export async function reportDamage(store, user, toolId) {
  const tool = await store.tools.get(toolId);
  if (!tool) throw new HttpError(404, "toolId: outil introuvable");

  if (tool.ownerId !== user.id) {
    const loans = await store.loans.list();
    const isBorrower = loans.some(
      (loan) => loan.toolId === toolId && loan.borrowerId === user.id && loan.status === "accepted",
    );
    if (!isBorrower) {
      throw new HttpError(403, "abime: seul le propriétaire ou l'emprunteur ayant un prêt accepté peut signaler cet outil");
    }
  }

  const updated = await store.tools.update(toolId, { abime: true });
  if (!updated) throw new HttpError(404, "toolId: outil introuvable");
  return updated;
}
