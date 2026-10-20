import { parseApiError } from "./apiError.js";

const TOOL_STATUS = { available: "Disponible", lent: "Prêté", unavailable: "Indisponible" };
const LOAN_STATUS = { pending: "En attente", accepted: "Acceptée", refused: "Refusée", returned: "Rendue" };
const USER_KEY = "bricoloop.userId";

const $ = (selector) => document.querySelector(selector);

const userInput = $("#user-id");
const catalogue = $("#catalogue");
const catalogueStatus = $("#catalogue-status");
const lendForm = $("#lend-form");
const description = $("#description");
const descriptionCount = $("#description-count");
const myLoans = $("#my-loans");
const myLoansStatus = $("#my-loans-status");
const respondForm = $("#respond-form");
const dialog = $("#tool-dialog");
const borrowForm = $("#borrow-form");
const damageForm = $("#damage-form");

// Noms des outils, pour afficher « Mes emprunts » sans refaire une requête par ligne.
let toolNames = new Map();
let currentToolId = null;

// localStorage peut être indisponible (navigation privée) : l'identifiant n'est alors pas mémorisé.
function loadUserId() {
  try {
    return localStorage.getItem(USER_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveUserId(id) {
  try {
    localStorage.setItem(USER_KEY, id);
  } catch {
    // sans mémorisation
  }
}

// Appel à l'API avec X-User-Id ; renvoie { ok, status, data } sans lever d'exception HTTP.
async function api(method, url, body) {
  const headers = {};
  const userId = userInput.value.trim();
  if (userId) headers["X-User-Id"] = userId;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function badge(status, labels) {
  return el("span", `status status--${status}`, labels[status] ?? status);
}

// Les erreurs de l'API ont la forme "<champ>: <message>" : on les place sous le champ concerné.
function resetForm(form) {
  form.querySelectorAll("[data-error-for]").forEach((slot) => (slot.textContent = ""));
  form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
  userInput.removeAttribute("aria-invalid");
  setMessage(form, "", "");
}

function setMessage(form, text, kind) {
  const message = form.querySelector(".form-message");
  message.textContent = text;
  message.className = `form-message ${kind}`;
}

function showApiError(form, data) {
  const { field, message } = parseApiError(data);
  if (field === "X-User-Id") {
    userInput.setAttribute("aria-invalid", "true");
    userInput.focus();
    setMessage(form, "Indique d'abord ton numéro d'utilisateur (en haut à droite).", "error");
    return;
  }
  const slot = form.querySelector(`[data-error-for="${field}"]`);
  if (slot) {
    slot.textContent = message;
    form.elements[field]?.setAttribute("aria-invalid", "true");
    return;
  }
  setMessage(form, message, "error");
}

async function submitWith(form, action) {
  resetForm(form);
  const buttons = form.querySelectorAll("button");
  buttons.forEach((b) => (b.disabled = true));
  try {
    await action();
  } catch (err) {
    setMessage(form, `Erreur réseau : ${err.message}`, "error");
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}

// US-01 : catalogue, déjà trié par l'API (disponibles en premier).
async function loadCatalogue() {
  catalogueStatus.textContent = "Chargement…";
  try {
    const { ok, data } = await api("GET", "/api/tools");
    if (!ok) throw new Error(parseApiError(data).message);
    toolNames = new Map(data.map((tool) => [tool.id, tool.name]));
    catalogueStatus.textContent = data.length === 0 ? "Aucun outil pour l'instant." : `${data.length} outil(s)`;
    catalogue.replaceChildren(...data.map(renderTool));
  } catch (err) {
    catalogue.replaceChildren();
    catalogueStatus.textContent = `Impossible de charger le catalogue : ${err.message}`;
  }
}

function renderTool(tool) {
  const item = el("li");
  const card = el("button", `tool tool--${tool.status}`);
  card.type = "button";
  card.addEventListener("click", () => openTool(tool.id));

  const meta = el("span", "tool__meta");
  meta.append(el("span", "chip", tool.category), badge(tool.status, TOOL_STATUS));
  if (tool.abime) meta.append(el("span", "chip", "Abîmé"));
  card.append(el("span", "tool__name", tool.name), meta);
  if (tool.description) card.append(el("span", "tool__description", tool.description));

  item.append(card);
  return item;
}

// US-03 : fiche de l'outil et propriétaire ; US-04 : formulaire de demande d'emprunt.
async function openTool(id) {
  currentToolId = id;
  resetForm(borrowForm);
  resetForm(damageForm);
  damageForm.hidden = true;
  $("#tool-dialog-damage").textContent = "";
  borrowForm.reset();
  $("#tool-dialog-title").textContent = "Chargement…";
  $("#tool-dialog-meta").replaceChildren();
  $("#tool-dialog-description").textContent = "";
  $("#tool-dialog-owner").textContent = "";
  dialog.showModal();

  try {
    const { ok, data } = await api("GET", `/api/tools/${encodeURIComponent(id)}`);
    if (!ok) {
      $("#tool-dialog-title").textContent = parseApiError(data).message;
      return;
    }
    $("#tool-dialog-title").textContent = data.name;
    damageForm.hidden = false;
    $("#tool-dialog-damage").textContent = data.abime ? "Cet outil a été signalé abîmé." : "";
    $("#tool-dialog-meta").replaceChildren(el("span", "chip", data.category), badge(data.status, TOOL_STATUS));
    $("#tool-dialog-description").textContent = data.description ?? "Pas de description.";
    $("#tool-dialog-owner").textContent = data.owner
      ? `Prêté par ${data.owner.firstName}, quartier ${data.owner.district}`
      : "Propriétaire inconnu";
  } catch (err) {
    $("#tool-dialog-title").textContent = `Erreur réseau : ${err.message}`;
  }
}

// US-15 : les refus de l'API sont affichés en clair dans la fiche.
async function signalDamage(event) {
  event.preventDefault();
  const toolId = currentToolId;
  await submitWith(damageForm, async () => {
    const res = await api("PATCH", `/api/tools/${encodeURIComponent(toolId)}/abime`);
    if (currentToolId !== toolId) return;
    if (!res.ok) return showApiError(damageForm, res.data);
    $("#tool-dialog-damage").textContent = "Cet outil a été signalé abîmé.";
    setMessage(damageForm, "Signalement enregistré.", "success");
    await loadCatalogue();
  });
}

async function borrowTool(event) {
  event.preventDefault();
  await submitWith(borrowForm, async () => {
    const data = new FormData(borrowForm);
    const res = await api("POST", "/api/loans", {
      toolId: currentToolId,
      startDate: data.get("startDate"),
      endDate: data.get("endDate"),
    });
    if (!res.ok) return showApiError(borrowForm, res.data);
    setMessage(borrowForm, `Demande n°${res.data.id} envoyée, en attente de réponse du propriétaire.`, "success");
    await loadMyLoans();
  });
}

// US-02 : prêter un outil.
async function lendTool(event) {
  event.preventDefault();
  await submitWith(lendForm, async () => {
    const data = new FormData(lendForm);
    const body = { name: data.get("name"), category: data.get("category") };
    if (data.get("description")) body.description = data.get("description");

    const res = await api("POST", "/api/tools", body);
    if (!res.ok) return showApiError(lendForm, res.data);
    lendForm.reset();
    descriptionCount.textContent = "0";
    setMessage(lendForm, `« ${res.data.name} » est maintenant proposé au prêt.`, "success");
    await loadCatalogue();
  });
}

// US-08 : mes demandes et mes emprunts, triés par l'API.
async function loadMyLoans() {
  myLoans.replaceChildren();
  if (!userInput.value.trim()) {
    myLoansStatus.textContent = "Indique ton numéro d'utilisateur pour voir tes emprunts.";
    return;
  }
  myLoansStatus.textContent = "Chargement…";
  try {
    const { ok, data } = await api("GET", "/api/me/loans");
    if (!ok) {
      myLoansStatus.textContent = parseApiError(data).message;
      return;
    }
    myLoansStatus.textContent = data.length === 0 ? "Aucune demande pour l'instant." : "";
    myLoans.replaceChildren(...data.map(renderLoan));
  } catch (err) {
    myLoansStatus.textContent = `Erreur réseau : ${err.message}`;
  }
}

function renderLoan(loan) {
  const item = el("li", "loan");
  const head = el("div", "loan__head");
  head.append(el("strong", "", toolNames.get(loan.toolId) ?? `Outil n°${loan.toolId}`), badge(loan.status, LOAN_STATUS));
  item.append(head, el("span", "muted", `Du ${loan.startDate} au ${loan.endDate} · demande n°${loan.id}`));
  return item;
}

// US-05 : le propriétaire accepte ou refuse une demande ; US-07 : il déclare l'outil rendu.
async function respond(event) {
  event.preventDefault();
  const status = event.submitter?.value;
  await submitWith(respondForm, async () => {
    const loanId = new FormData(respondForm).get("loanId").trim();
    if (!loanId) return showApiError(respondForm, { error: "loan: indique le n° de la demande" });

    const id = encodeURIComponent(loanId);
    const res =
      status === "returned"
        ? await api("PATCH", `/api/returns/${id}/return`)
        : await api("PATCH", `/api/loans/${id}`, { status });
    if (!res.ok) return showApiError(respondForm, res.data);
    setMessage(respondForm, `Demande n°${res.data.id} : ${LOAN_STATUS[res.data.status].toLowerCase()}.`, "success");
    await Promise.all([loadCatalogue(), loadMyLoans()]);
  });
}

userInput.value = loadUserId();
userInput.addEventListener("change", () => {
  userInput.removeAttribute("aria-invalid");
  saveUserId(userInput.value.trim());
  loadMyLoans();
});
description.addEventListener("input", () => (descriptionCount.textContent = String(description.value.length)));
lendForm.addEventListener("submit", lendTool);
borrowForm.addEventListener("submit", borrowTool);
damageForm.addEventListener("submit", signalDamage);
respondForm.addEventListener("submit", respond);
$("#catalogue-refresh").addEventListener("click", loadCatalogue);
$("#my-loans-refresh").addEventListener("click", loadMyLoans);
$("#tool-dialog-close").addEventListener("click", () => dialog.close());

await loadCatalogue();
await loadMyLoans();
