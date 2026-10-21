# Agenda Personal — Laboratorio 4

Aplicación de agenda personal construida con Node.js, Express, HTML, CSS y JavaScript Fetch API. Los eventos se almacenan como archivos `.txt` locales.

## Requisitos
- Node.js (versión LTS recomendada)
- npm (se instala con Node.js)

## Instalación y ejecución
1. Descomprime la carpeta del proyecto.
2. Abre una terminal dentro de `agenda_node_express`.
3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Inicia el servidor:

   ```bash
   npm start
   ```

5. Abre `http://localhost:3000` en el navegador.

## Estructura
- `server.js`: servidor Express y API REST.
- `pub/index.html`: interfaz de una sola página.
- `pub/css/styles.css`: estilos.
- `pub/js/app.js`: árbol de eventos y peticiones Fetch/AJAX.
- `data/events/`: archivos `.txt` de eventos.

## Formato de almacenamiento
Cada evento se guarda en un archivo cuyo nombre usa fecha y hora, por ejemplo `2026-10-21_14-30.txt`. La primera línea contiene el título; las líneas siguientes, la descripción. La fecha y hora identifican el evento, por lo que no se permite duplicar la misma combinación.

## Endpoints
- `GET /api/events`: lista eventos.
- `GET /api/events/:id`: obtiene el detalle.
- `POST /api/events`: crea un evento.
- `PUT /api/events/:id`: edita un evento.
- `DELETE /api/events/:id`: elimina un evento.

## Pruebas manuales sugeridas
1. Crear un evento y comprobar que aparece en el árbol.
2. Crear otro evento con la misma fecha y hora: debe mostrar un error de duplicado.
3. Seleccionar un evento, editar su título o descripción y guardar.
4. Seleccionar un evento y eliminarlo.
5. Recargar la página y comprobar que los eventos siguen guardados.

## Para el informe
Incluye capturas reales de la aplicación ejecutándose, pruebas de creación/edición/eliminación y capturas de tus propios commits. Explica los fragmentos de `server.js` y `pub/js/app.js`. No inventes capturas ni commits: deben corresponder a tu trabajo.
