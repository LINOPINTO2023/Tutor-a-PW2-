const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "pub");
const EVENTS_DIR = path.join(__dirname, "data", "events");

app.use(express.json({ limit: "100kb" }));
app.use(express.static(PUBLIC_DIR));

function validDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(`${date}T00:00:00`));
}

function validTime(time) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function eventId(date, time) {
  // El identificador depende de la fecha y hora: no permite duplicarlos.
  return `${date}_${time.replace(":", "-")}`;
}

function eventPath(id) {
  // Solo acepta el formato generado por eventId; evita rutas arbitrarias.
  if (!/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}$/.test(id)) return null;
  return path.join(EVENTS_DIR, `${id}.txt`);
}

async function ensureEventsDir() {
  await fs.mkdir(EVENTS_DIR, { recursive: true });
}

async function readEvent(filePath, id) {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const [date, time] = id.split("_");
  return {
    id,
    date,
    time: time.replace("-", ":"),
    title: lines[0] || "",
    description: lines.slice(1).join("\n")
  };
}

async function listEvents() {
  await ensureEventsDir();
  const names = await fs.readdir(EVENTS_DIR);
  const events = [];
  for (const name of names) {
    if (!name.endsWith(".txt")) continue;
    const id = name.slice(0, -4);
    const filePath = eventPath(id);
    if (!filePath) continue;
    try {
      events.push(await readEvent(filePath, id));
    } catch (error) {
      console.error(`No se pudo leer ${name}:`, error.message);
    }
  }
  return events.sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );
}

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/api/events", async (req, res) => {
  try {
    res.json(await listEvents());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar los eventos." });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const filePath = eventPath(req.params.id);
    if (!filePath) return res.status(400).json({ error: "Identificador inválido." });
    const event = await readEvent(filePath, req.params.id);
    res.json(event);
  } catch (error) {
    if (error.code === "ENOENT") return res.status(404).json({ error: "El evento no existe." });
    console.error(error);
    res.status(500).json({ error: "No se pudo abrir el evento." });
  }
});

app.post("/api/events", async (req, res) => {
  const { date, time, title, description = "" } = req.body || {};
  if (!validDate(date) || !validTime(time) || !String(title || "").trim()) {
    return res.status(400).json({ error: "Completa una fecha, hora y título válidos." });
  }

  const cleanTitle = String(title).trim();
  const cleanDescription = String(description).trim();
  const id = eventId(date, time);
  const filePath = eventPath(id);

  try {
    await ensureEventsDir();
    // wx crea el archivo solo si no existe; evita sobrescribir un evento.
    await fs.writeFile(filePath, `${cleanTitle}\n${cleanDescription}`, { flag: "wx" });
    res.status(201).json({ message: "Evento creado correctamente.", id });
  } catch (error) {
    if (error.code === "EEXIST") {
      return res.status(409).json({ error: "Ya existe un evento para esa fecha y hora." });
    }
    console.error(error);
    res.status(500).json({ error: "No se pudo guardar el evento." });
  }
});

app.put("/api/events/:id", async (req, res) => {
  const oldPath = eventPath(req.params.id);
  if (!oldPath) return res.status(400).json({ error: "Identificador inválido." });

  const { date, time, title, description = "" } = req.body || {};
  if (!validDate(date) || !validTime(time) || !String(title || "").trim()) {
    return res.status(400).json({ error: "Completa una fecha, hora y título válidos." });
  }

  const newId = eventId(date, time);
  const newPath = eventPath(newId);
  const content = `${String(title).trim()}\n${String(description).trim()}`;

  try {
    await fs.access(oldPath);
    if (newId !== req.params.id) {
      try {
        await fs.access(newPath);
        return res.status(409).json({ error: "Ya existe otro evento en la nueva fecha y hora." });
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      await fs.writeFile(newPath, content, { flag: "wx" });
      await fs.unlink(oldPath);
    } else {
      await fs.writeFile(oldPath, content);
    }
    res.json({ message: "Evento actualizado correctamente.", id: newId });
  } catch (error) {
    if (error.code === "ENOENT") return res.status(404).json({ error: "El evento ya no existe." });
    if (error.code === "EEXIST") return res.status(409).json({ error: "Ya existe un evento para esa fecha y hora." });
    console.error(error);
    res.status(500).json({ error: "No se pudo actualizar el evento." });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  const filePath = eventPath(req.params.id);
  if (!filePath) return res.status(400).json({ error: "Identificador inválido." });
  try {
    await fs.unlink(filePath);
    res.json({ message: "Evento eliminado correctamente." });
  } catch (error) {
    if (error.code === "ENOENT") return res.status(404).json({ error: "El evento no existe." });
    console.error(error);
    res.status(500).json({ error: "No se pudo eliminar el evento." });
  }
});

app.listen(PORT, () => {
  console.log(`Agenda Personal disponible en http://localhost:${PORT}`);
});
