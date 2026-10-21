const API = 'api/eventos';

const form = document.querySelector('#formEvento');
const campoFecha = document.querySelector('#fecha');
const campoHora = document.querySelector('#hora');
const campoTitulo = document.querySelector('#titulo');
const campoDescripcion = document.querySelector('#descripcion');
const tituloFormulario = document.querySelector('#tituloFormulario');
const textoGuardar = document.querySelector('#textoGuardar');
const btnCancelar = document.querySelector('#btnCancelar');
const mensaje = document.querySelector('#mensaje');
const arbol = document.querySelector('#arbol');
const contador = document.querySelector('#contador');

let editando = null;

function mostrarMensaje(tipo, titulo, detalle = '') {
    mensaje.className = `mensaje ${tipo}`;
    mensaje.querySelector('.mensaje-icono').textContent = tipo === 'exito' ? 'check_circle' : 'error';
    mensaje.querySelector('.mensaje-titulo').textContent = titulo;
    mensaje.querySelector('.mensaje-detalle').textContent = detalle;
    mensaje.hidden = false;
}

async function pedir(url, opciones = {}) {
    let response;
    try {
        response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...opciones
        });
    } catch {
        throw new Error('No se pudo conectar con el servidor');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.error || `Error ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return data;
}

function rutaEvento(fecha, hora) {
    return `${API}/${fecha}/${hora}`;
}

function rutaArchivo(fecha, hora) {
    return `agenda/${fecha}/${hora}.txt`;
}

function horaLegible(hora) {
    return hora.replace('-', ':');
}

function crearElemento(etiqueta, clase, texto = '') {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    elemento.textContent = texto;
    return elemento;
}

function icono(nombre) {
    return crearElemento('span', 'material-symbols-outlined', nombre);
}

function plural(cantidad, singular, varios) {
    return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}

function crearFila(clase, nombreIcono, nombre, tipo) {
    const fila = crearElemento('div', `fila ${clase}`);
    fila.append(
        icono(nombreIcono),
        crearElemento('span', 'nombre', nombre),
        crearElemento('span', `chip ${tipo.toLowerCase()}`, tipo)
    );
    return fila;
}

function crearBotonIcono(nombreIcono, descripcion, clase, accion) {
    const boton = crearElemento('button', `boton-icono ${clase}`);
    boton.type = 'button';
    boton.title = descripcion;
    boton.setAttribute('aria-label', descripcion);
    boton.append(icono(nombreIcono));
    boton.addEventListener('click', accion);
    return boton;
}

function crearEstadoVacio() {
    const vacio = crearElemento('div', 'vacio');
    vacio.append(
        icono('folder_off'),
        crearElemento('h3', '', 'No hay eventos registrados')
    );
    return vacio;
}

function crearFilaEvento(fecha, hora, titulo) {
    const fila = crearFila('archivo', 'description', `${hora}.txt`, 'FILE');
    fila.dataset.fecha = fecha;
    fila.dataset.hora = hora;

    const acciones = crearElemento('span', 'acciones-evento');
    acciones.append(
        crearBotonIcono('edit', 'Editar evento', 'editar', () => editarEvento(fecha, hora)),
        crearBotonIcono('delete', 'Eliminar evento', 'eliminar', () => eliminarEvento(fecha, hora, titulo))
    );

    fila.append(
        crearElemento('span', 'titulo-evento', titulo),
        crearElemento('span', 'meta', horaLegible(hora)),
        acciones
    );
    return fila;
}

function dibujarArbol(fechas) {
    const total = fechas.reduce((suma, { eventos }) => suma + eventos.length, 0);
    contador.textContent = plural(total, 'evento', 'eventos');

    arbol.replaceChildren(crearFila('raiz', 'folder', 'agenda', 'DIR'));

    if (fechas.length === 0) {
        arbol.append(crearElemento('p', 'subvacio', '(vacío)'), crearEstadoVacio());
        return;
    }

    const listaFechas = document.createElement('ul');
    for (const { fecha, eventos } of fechas) {
        const filaFecha = crearFila('carpeta', 'folder', fecha, 'DIR');
        filaFecha.append(crearElemento('span', 'meta', plural(eventos.length, 'evento', 'eventos')));

        const listaEventos = document.createElement('ul');
        for (const { hora, titulo } of eventos) {
            const itemEvento = document.createElement('li');
            itemEvento.append(crearFilaEvento(fecha, hora, titulo));
            listaEventos.append(itemEvento);
        }

        const itemFecha = document.createElement('li');
        itemFecha.append(filaFecha, listaEventos);
        listaFechas.append(itemFecha);
    }
    arbol.append(listaFechas);
    marcarEditando();
}

function marcarEditando() {
    for (const fila of arbol.querySelectorAll('.fila.archivo')) {
        const activa = editando !== null
            && fila.dataset.fecha === editando.fecha
            && fila.dataset.hora === editando.hora;
        fila.classList.toggle('editando', activa);
    }
}

function modoCreacion() {
    editando = null;
    form.reset();
    campoFecha.disabled = false;
    campoHora.disabled = false;
    tituloFormulario.textContent = 'Nuevo evento';
    textoGuardar.textContent = 'Guardar evento';
    btnCancelar.hidden = true;
    marcarEditando();
}

async function cargarEventos() {
    try {
        dibujarArbol(await pedir(API));
    } catch (err) {
        mostrarMensaje('error', 'No se pudo cargar la agenda', err.message);
    }
}

async function editarEvento(fecha, hora) {
    try {
        const evento = await pedir(rutaEvento(fecha, hora));
        editando = { fecha, hora };
        campoFecha.value = fecha;
        campoHora.value = horaLegible(hora);
        campoTitulo.value = evento.titulo;
        campoDescripcion.value = evento.descripcion;
        campoFecha.disabled = true;
        campoHora.disabled = true;
        tituloFormulario.textContent = 'Editar evento';
        textoGuardar.textContent = 'Guardar cambios';
        btnCancelar.hidden = false;
        mensaje.hidden = true;
        marcarEditando();
        campoTitulo.focus();
    } catch (err) {
        mostrarMensaje('error', err.message);
        await cargarEventos();
    }
}

async function eliminarEvento(fecha, hora, titulo) {
    if (!confirm(`¿Eliminar el evento «${titulo}» del ${fecha} a las ${horaLegible(hora)}?`)) {
        return;
    }

    try {
        const respuesta = await pedir(rutaEvento(fecha, hora), { method: 'DELETE' });
        if (editando && editando.fecha === fecha && editando.hora === hora) {
            modoCreacion();
        }
        mostrarMensaje('exito', respuesta.mensaje, `Se borró ${rutaArchivo(fecha, hora)}`);
    } catch (err) {
        mostrarMensaje('error', err.message);
    }
    await cargarEventos();
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fecha = campoFecha.value;
    const hora = campoHora.value.slice(0, 5).replace(':', '-');
    const archivo = rutaArchivo(fecha, hora);
    const contenido = {
        titulo: campoTitulo.value,
        descripcion: campoDescripcion.value
    };

    try {
        if (editando) {
            const respuesta = await pedir(rutaEvento(editando.fecha, editando.hora), {
                method: 'PUT',
                body: JSON.stringify(contenido)
            });
            modoCreacion();
            mostrarMensaje('exito', respuesta.mensaje, `Se actualizó ${archivo}`);
        } else {
            const respuesta = await pedir(API, {
                method: 'POST',
                body: JSON.stringify({ fecha, hora, ...contenido })
            });
            form.reset();
            mostrarMensaje('exito', respuesta.mensaje, `Se guardó en ${archivo}`);
        }
        await cargarEventos();
    } catch (err) {
        const detalle = err.status === 409
            ? `El archivo ${archivo} ya existe. Elige otra fecha u hora.`
            : '';
        mostrarMensaje('error', err.message, detalle);
    }
});

btnCancelar.addEventListener('click', () => {
    modoCreacion();
    mensaje.hidden = true;
});

cargarEventos();
