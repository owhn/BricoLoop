import { parseApiError } from "./apiError.js";

const STATUS_LABELS = { available: "Disponible", lent: "Prêté", unavailable: "Indisponible" };
const USER_KEY = "bricoloop.userId";

const userInput = document.querySelector("#user-id");
const catalogue = document.querySelector("#catalogue");
const catalogueStatus = document.querySelector("#catalogue-status");
const form = document.querySelector("#lend-form");
const formMessage = document.querySelector("#form-message");
const description = document.querySelector("#description");
const descriptionCount = document.querySelector("#description-count");

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

// US-01 : catalogue, déjà trié par l'API (disponibles en premier).
async function loadCatalogue() {
  catalogueStatus.textContent = "Chargement…";
  try {
    const res = await fetch("/api/tools");
    if (!res.ok) throw new Error(parseApiError(await res.json()).message);
    renderCatalogue(await res.json());
  } catch (err) {
    catalogue.replaceChildren();
    catalogueStatus.textContent = `Impossible de charger le catalogue : ${err.message}`;
  }
}

function renderCatalogue(tools) {
  catalogueStatus.textContent = tools.length === 0 ? "Aucun outil pour l'instant." : `${tools.length} outil(s)`;
  catalogue.replaceChildren(...tools.map(renderTool));
}

function renderTool(tool) {
  const item = document.createElement("li");
  item.className = `tool tool--${tool.status}`;

  const title = document.createElement("h3");
  title.textContent = tool.name;

  const meta = document.createElement("p");
  meta.className = "tool__meta";
  const category = document.createElement("span");
  category.className = "chip";
  category.textContent = tool.category;
  const status = document.createElement("span");
  status.className = `status status--${tool.status}`;
  status.textContent = STATUS_LABELS[tool.status] ?? tool.status;
  meta.append(category, status);

  item.append(title, meta);
  if (tool.description) {
    const text = document.createElement("p");
    text.className = "tool__description";
    text.textContent = tool.description;
    item.append(text);
  }
  return item;
}

function clearErrors() {
  form.querySelectorAll("[data-error-for]").forEach((el) => (el.textContent = ""));
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  userInput.removeAttribute("aria-invalid");
  formMessage.textContent = "";
  formMessage.className = "";
}

function showError(field, message) {
  const slot = form.querySelector(`[data-error-for="${field}"]`);
  if (slot) {
    slot.textContent = message;
    form.elements[field]?.setAttribute("aria-invalid", "true");
    return;
  }
  if (field === "X-User-Id") userInput.setAttribute("aria-invalid", "true");
  formMessage.textContent = message;
  formMessage.className = "error";
}

// US-02 : prêter un outil. La validation est faite par l'API, on affiche ses erreurs sous le bon champ.
async function lendTool(event) {
  event.preventDefault();
  clearErrors();

  const data = new FormData(form);
  const body = { name: data.get("name"), category: data.get("category") };
  if (data.get("description")) body.description = data.get("description");

  const headers = { "Content-Type": "application/json" };
  const userId = userInput.value.trim();
  if (userId) headers["X-User-Id"] = userId;

  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const res = await fetch("/api/tools", { method: "POST", headers, body: JSON.stringify(body) });
    if (res.status === 201) {
      const tool = await res.json();
      form.reset();
      descriptionCount.textContent = "0";
      formMessage.textContent = `« ${tool.name} » est maintenant proposé au prêt.`;
      formMessage.className = "success";
      await loadCatalogue();
      return;
    }
    const { field, message } = parseApiError(await res.json());
    showError(field, field === "X-User-Id" ? "Indique d'abord ton numéro d'utilisateur (en haut à droite)." : message);
  } catch (err) {
    showError(null, `Erreur réseau : ${err.message}`);
  } finally {
    button.disabled = false;
  }
}

userInput.value = loadUserId();
userInput.addEventListener("change", () => saveUserId(userInput.value.trim()));
description.addEventListener("input", () => (descriptionCount.textContent = String(description.value.length)));
form.addEventListener("submit", lendTool);
loadCatalogue();
