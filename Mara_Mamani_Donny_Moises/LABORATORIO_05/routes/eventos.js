const fs = require('fs/promises');
const path = require('path');
const express = require('express');

const router = express.Router();

const AGENDA_DIR = path.join(__dirname, '..', 'agenda');
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;      // 2026-10-21
const HORA_RE = /^\d{2}-\d{2}$/;             // 10-30
const ARCHIVO_RE = /^\d{2}-\d{2}\.txt$/;     // 10-30.txt

router.get('/', async (request, response) => {
    try {
        let carpetas = [];
        try {
            carpetas = await fs.readdir(AGENDA_DIR, { withFileTypes: true });
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;   
        }

        const fechas = carpetas
            .filter(d => d.isDirectory() && FECHA_RE.test(d.name))
            .map(d => d.name)
            .sort();

        const arbol = [];
        for (const fecha of fechas) {
            const archivos = (await fs.readdir(path.join(AGENDA_DIR, fecha)))
                .filter(a => ARCHIVO_RE.test(a))
                .sort();

            const eventos = [];
            for (const archivo of archivos) {
                const contenido = await fs.readFile(path.join(AGENDA_DIR, fecha, archivo), 'utf8');
                eventos.push({
                    hora: archivo.replace('.txt', ''),
                    titulo: contenido.split(/\r?\n/)[0]   
                });
            }
            arbol.push({ fecha, eventos });
        }

        response.json(arbol);
    } catch (err) {
        console.error(err);
        response.status(500).json({ error: 'No se pudo leer la agenda' });
    }
});

router.post('/', async (request, response) => {
    const { fecha, hora, titulo, descripcion = '' } = request.body;

    if (!FECHA_RE.test(fecha) || !HORA_RE.test(hora)) {
        return response.status(400).json({ error: 'Fecha u hora con formato inválido' });
    }
    if (typeof titulo !== 'string' || !titulo.trim() || /[\r\n]/.test(titulo)) {
        return response.status(400).json({ error: 'El título es obligatorio y debe ser de una sola línea' });
    }

    const carpeta = path.join(AGENDA_DIR, fecha);
    try {
        await fs.mkdir(carpeta, { recursive: true });
        await fs.writeFile(path.join(carpeta, `${hora}.txt`), `${titulo.trim()}\n${descripcion}`, { flag: 'wx' });
        response.status(201).json({ mensaje: 'Evento creado' });
    } catch (err) {
        if (err.code === 'EEXIST') {
            return response.status(409).json({ error: 'Ya existe un evento en esa fecha y hora' });
        }
        console.error(err);
        response.status(500).json({ error: 'No se pudo crear el evento' });
    }
});

module.exports = router;
