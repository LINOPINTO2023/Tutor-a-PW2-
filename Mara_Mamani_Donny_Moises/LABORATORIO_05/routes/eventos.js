const fs = require('fs/promises');
const path = require('path');
const express = require('express');

const router = express.Router();

const AGENDA_DIR = path.join(__dirname, '..', 'agenda');
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;      // 2026-10-21
const HORA_RE = /^\d{2}-\d{2}$/;             // 10-30
const ARCHIVO_RE = /^\d{2}-\d{2}\.txt$/;     // 10-30.txt

const ERROR_FECHA_HORA = 'Fecha u hora con formato inválido';
const ERROR_TITULO = 'El título es obligatorio y debe ser de una sola línea';
const ERROR_NO_EXISTE = 'No existe un evento en esa fecha y hora';

function fechaHoraValidas(fecha, hora) {
    return FECHA_RE.test(fecha) && HORA_RE.test(hora);
}

function tituloValido(titulo) {
    return typeof titulo === 'string' && titulo.trim() !== '' && !/[\r\n]/.test(titulo);
}

function rutaEvento(fecha, hora) {
    return path.join(AGENDA_DIR, fecha, `${hora}.txt`);
}

// Línea 1 = título, resto = descripción
function contenidoEvento(titulo, descripcion = '') {
    return `${titulo.trim()}\n${descripcion}`;
}

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
    const { fecha, hora, titulo, descripcion } = request.body;

    if (!fechaHoraValidas(fecha, hora)) {
        return response.status(400).json({ error: ERROR_FECHA_HORA });
    }
    if (!tituloValido(titulo)) {
        return response.status(400).json({ error: ERROR_TITULO });
    }

    try {
        await fs.mkdir(path.join(AGENDA_DIR, fecha), { recursive: true });
        await fs.writeFile(rutaEvento(fecha, hora), contenidoEvento(titulo, descripcion), { flag: 'wx' });
        response.status(201).json({ mensaje: 'Evento creado' });
    } catch (err) {
        if (err.code === 'EEXIST') {
            return response.status(409).json({ error: 'Ya existe un evento en esa fecha y hora' });
        }
        console.error(err);
        response.status(500).json({ error: 'No se pudo crear el evento' });
    }
});

// Ver detalle: muestra el contenido completo del archivo (para editar)
router.get('/:fecha/:hora', async (request, response) => {
    const { fecha, hora } = request.params;

    if (!fechaHoraValidas(fecha, hora)) {
        return response.status(400).json({ error: ERROR_FECHA_HORA });
    }

    try {
        const contenido = await fs.readFile(rutaEvento(fecha, hora), 'utf8');
        const [titulo, ...resto] = contenido.split(/\r?\n/);
        response.json({ fecha, hora, titulo, descripcion: resto.join('\n') });
    } catch (err) {
        if (err.code === 'ENOENT') {
            return response.status(404).json({ error: ERROR_NO_EXISTE });
        }
        console.error(err);
        response.status(500).json({ error: 'No se pudo leer el evento' });
    }
});

// Editar: solo cambia título y descripción; la fecha y hora identifican el archivo
router.put('/:fecha/:hora', async (request, response) => {
    const { fecha, hora } = request.params;
    const { titulo, descripcion } = request.body;

    if (!fechaHoraValidas(fecha, hora)) {
        return response.status(400).json({ error: ERROR_FECHA_HORA });
    }
    if (!tituloValido(titulo)) {
        return response.status(400).json({ error: ERROR_TITULO });
    }

    try {
        await fs.access(rutaEvento(fecha, hora));   // falla con ENOENT si no existe
        await fs.writeFile(rutaEvento(fecha, hora), contenidoEvento(titulo, descripcion));
        response.json({ mensaje: 'Evento actualizado' });
    } catch (err) {
        if (err.code === 'ENOENT') {
            return response.status(404).json({ error: ERROR_NO_EXISTE });
        }
        console.error(err);
        response.status(500).json({ error: 'No se pudo editar el evento' });
    }
});

// Eliminar: borra el archivo y, si el día queda vacío, también su carpeta
router.delete('/:fecha/:hora', async (request, response) => {
    const { fecha, hora } = request.params;

    if (!fechaHoraValidas(fecha, hora)) {
        return response.status(400).json({ error: ERROR_FECHA_HORA });
    }

    try {
        await fs.unlink(rutaEvento(fecha, hora));

        const carpeta = path.join(AGENDA_DIR, fecha);
        if ((await fs.readdir(carpeta)).length === 0) {
            await fs.rmdir(carpeta);
        }
        response.json({ mensaje: 'Evento eliminado' });
    } catch (err) {
        if (err.code === 'ENOENT') {
            return response.status(404).json({ error: ERROR_NO_EXISTE });
        }
        console.error(err);
        response.status(500).json({ error: 'No se pudo eliminar el evento' });
    }
});

module.exports = router;
