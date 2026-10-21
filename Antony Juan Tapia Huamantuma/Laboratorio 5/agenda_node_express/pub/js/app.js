const form = document.querySelector("#eventForm");
const dateInput = document.querySelector("#date");
const timeInput = document.querySelector("#time");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const tree = document.querySelector("#eventTree");
const notice = document.querySelector("#notice");
const formHeading = document.querySelector("#formHeading");
const modeBadge = document.querySelector("#modeBadge");
const saveButton = document.querySelector("#saveButton");
const cancelButton = document.querySelector("#cancelButton");
const deleteButton = document.querySelector("#deleteButton");
const clearButton = document.querySelector("#clearButton");
const refreshButton = document.querySelector("#refreshButton");

let editingId = null;
let allEvents = [];

function showNotice(message, type = "success") {
  notice.textContent = message;
  notice.className = `notice ${type}`;
  notice.hidden = false;
}
function hideNotice() {
  notice.hidden = true;
  notice.textContent = "";
}
async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Ocurrió un error.");
  return data;
}
function escapeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}
function monthName(month) {
  return new Date(2000, Number(month) - 1, 1).toLocaleDateString("es-PE", { month: "long" });
}
function makeButton(text, className, onClick, ariaLabel) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.innerHTML = text;
  if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
  button.addEventListener("click", onClick);
  return button;
}
function renderTree(events) {
  tree.replaceChildren();
  if (!events.length) {
    const empty = document.createElement("div");
    empty.className = "tree-empty";
    empty.textContent = "Todavía no hay eventos. Crea uno desde el formulario.";
    tree.append(empty);
    return;
  }

  const years = new Map();
  for (const event of events) {
    const [year, month, day] = event.date.split("-");
    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year);
    if (!months.has(month)) months.set(month, new Map());
    const days = months.get(month);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(event);
  }

  for (const [year, months] of years) {
    const yearNode = document.createElement("div");
    yearNode.className = "tree-node";
    const yearChildren = document.createElement("div");
    yearChildren.className = "tree-children";
    const yearToggle = makeButton(`<span class="chevron">▾</span>▣ ${year}`, "tree-toggle", () => toggle(yearToggle, yearChildren));
    yearNode.append(yearToggle, yearChildren);
    tree.append(yearNode);

    for (const [month, days] of months) {
      const monthNode = document.createElement("div");
      monthNode.className = "tree-node";
      const monthChildren = document.createElement("div");
      monthChildren.className = "tree-children";
      const monthToggle = makeButton(`<span class="chevron">▾</span>▸ ${escapeText(monthName(month))}`, "tree-toggle", () => toggle(monthToggle, monthChildren));
      monthNode.append(monthToggle, monthChildren);
      yearChildren.append(monthNode);

      for (const [day, dayEvents] of days) {
        const dayNode = document.createElement("div");
        dayNode.className = "tree-node";
        const dayChildren = document.createElement("div");
        dayChildren.className = "tree-children";
        const dayToggle = makeButton(`<span class="chevron">▾</span>▸ Día ${day}`, "tree-toggle", () => toggle(dayToggle, dayChildren));
        dayNode.append(dayToggle, dayChildren);
        monthChildren.append(dayNode);

        for (const event of dayEvents) {
          const eventButton = makeButton(`<span class="file-icon">▤</span><span>${escapeText(event.title)}</span>`, `event-link${event.id === editingId ? " active" : ""}`, () => loadEvent(event.id));
          eventButton.title = `${event.date} ${event.time}`;
          dayChildren.append(eventButton);
        }
      }
    }
  }
}
function toggle(button, children) {
  const isHidden = children.hidden;
  children.hidden = !isHidden;
  button.querySelector(".chevron").textContent = isHidden ? "▾" : "▸";
}
async function loadEvents() {
  tree.innerHTML = '<p class="muted">Cargando eventos…</p>';
  try {
    allEvents = await api("/api/events");
    renderTree(allEvents);
  } catch (error) {
    tree.innerHTML = "";
    const message = document.createElement("p");
    message.className = "muted";
    message.textContent = error.message;
    tree.append(message);
  }
}
async function loadEvent(id) {
  hideNotice();
  try {
    const event = await api(`/api/events/${encodeURIComponent(id)}`);
    editingId = event.id;
    dateInput.value = event.date;
    timeInput.value = event.time;
    titleInput.value = event.title;
    descriptionInput.value = event.description;
    formHeading.textContent = "Editar evento";
    modeBadge.textContent = "EDITANDO";
    modeBadge.classList.add("edit");
    saveButton.textContent = "Guardar cambios";
    cancelButton.hidden = false;
    deleteButton.hidden = false;
    renderTree(allEvents);
  } catch (error) {
    showNotice(error.message, "error");
  }
}
function resetForm() {
  form.reset();
  editingId = null;
  formHeading.textContent = "Crear evento";
  modeBadge.textContent = "NUEVO";
  modeBadge.classList.remove("edit");
  saveButton.textContent = "＋ Guardar evento";
  cancelButton.hidden = true;
  deleteButton.hidden = true;
  renderTree(allEvents);
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  hideNotice();
  const body = {
    date: dateInput.value,
    time: timeInput.value,
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim()
  };
  saveButton.disabled = true;
  try {
    const url = editingId ? `/api/events/${encodeURIComponent(editingId)}` : "/api/events";
    const method = editingId ? "PUT" : "POST";
    const result = await api(url, { method, body: JSON.stringify(body) });
    showNotice(result.message);
    resetForm();
    await loadEvents();
  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});
deleteButton.addEventListener("click", async () => {
  if (!editingId) return;
  const event = allEvents.find(item => item.id === editingId);
  if (!confirm(`¿Seguro que deseas eliminar "${event ? event.title : "este evento"}"?`)) return;
  try {
    const result = await api(`/api/events/${encodeURIComponent(editingId)}`, { method: "DELETE" });
    resetForm();
    await loadEvents();
    showNotice(result.message);
  } catch (error) {
    showNotice(error.message, "error");
  }
});
cancelButton.addEventListener("click", () => { resetForm(); hideNotice(); });
clearButton.addEventListener("click", () => { resetForm(); hideNotice(); });
refreshButton.addEventListener("click", loadEvents);

loadEvents();
