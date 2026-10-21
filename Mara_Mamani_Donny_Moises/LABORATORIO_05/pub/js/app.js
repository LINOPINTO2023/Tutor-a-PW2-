const API = 'api/eventos';

const form = document.querySelector('#formEvento');
const campoFecha = document.querySelector('#fecha');
const campoHora = document.querySelector('#hora');
const campoTitulo = document.querySelector('#titulo');
const campoDescripcion = document.querySelector('#descripcion');
const mensaje = document.querySelector('#mensaje');
const arbol = document.querySelector('#arbol');
const contador = document.querySelector('#contador');

function mostrarMensaje(tipo, titulo, detalle = '') {
    mensaje.className = `mensaje ${tipo}`;
    mensaje.querySelector('.mensaje-icono').textContent = tipo === 'exito' ? 'check_circle' : 'error';
    mensaje.querySelector('.mensaje-titulo').textContent = titulo;
    mensaje.querySelector('.mensaje-detalle').textContent = detalle;
    mensaje.hidden = false;
}

async function pedir(url, opciones = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...opciones
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.error || `Error ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return data;
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

function crearEstadoVacio() {
    const vacio = crearElemento('div', 'vacio');
    vacio.append(
        icono('folder_off'),
        crearElemento('h3', '', 'No hay eventos registrados')
    );
    return vacio;
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
            const filaEvento = crearFila('archivo', 'description', `${hora}.txt`, 'FILE');
            filaEvento.append(
                crearElemento('span', 'titulo-evento', titulo),
                crearElemento('span', 'meta', hora.replace('-', ':'))
            );
            const itemEvento = document.createElement('li');
            itemEvento.append(filaEvento);
            listaEventos.append(itemEvento);
        }

        const itemFecha = document.createElement('li');
        itemFecha.append(filaFecha, listaEventos);
        listaFechas.append(itemFecha);
    }
    arbol.append(listaFechas);
}

async function cargarEventos() {
    try {
        dibujarArbol(await pedir(API));
    } catch (err) {
        mostrarMensaje('error', 'No se pudo cargar la agenda', err.message);
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const datos = {
        fecha: campoFecha.value,
        hora: campoHora.value.slice(0, 5).replace(':', '-'),
        titulo: campoTitulo.value,
        descripcion: campoDescripcion.value
    };
    const archivo = `agenda/${datos.fecha}/${datos.hora}.txt`;

    try {
        const respuesta = await pedir(API, { method: 'POST', body: JSON.stringify(datos) });
        mostrarMensaje('exito', respuesta.mensaje, `Se guardó en ${archivo}`);
        form.reset();
        await cargarEventos();
    } catch (err) {
        const detalle = err.status === 409
            ? `El archivo ${archivo} ya existe. Elige otra fecha u hora.`
            : '';
        mostrarMensaje('error', err.message, detalle);
    }
});

cargarEventos();
