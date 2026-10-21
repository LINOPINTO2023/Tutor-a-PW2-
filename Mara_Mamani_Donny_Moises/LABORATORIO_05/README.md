# Laboratorio 05 — Agenda personal con NodeJS + Express

Aplicación web de una sola página para administrar una agenda personal. Los eventos se guardan como archivos de texto en el servidor, organizados en una carpeta por fecha y un archivo por hora. En producción la aplicación se sirve a través de Nginx dentro de un contenedor Docker.

**Curso:** Programación Web — Universidad Nacional de San Agustín de Arequipa
**Estudiante:** Donny Moises Mara Mamani

## Funcionalidades

- **Crear evento** con fecha, hora, título y descripción. Si ya existe un evento en esa fecha y hora, no se crea y se muestra un error.
- **Ver eventos** en forma de árbol (carpeta por fecha y archivo por hora), mostrando solo el título.
- **Editar evento**: se muestra el contenido del archivo en el formulario y se guardan los cambios. La fecha y la hora no se pueden cambiar.
- **Eliminar evento**: si la carpeta del día queda vacía, también se elimina.

## Almacenamiento

```
agenda/
├── 2026-10-21/
│   ├── 10-00.txt
│   └── 13-30.txt
└── 2026-10-28/
    └── 16-31.txt
```

En cada archivo, la primera línea es el título del evento y las demás líneas son la descripción.

## Estructura del proyecto

```
LABORATORIO_05/
├── index.js            Servidor Express
├── routes/
│   └── eventos.js      Rutas de la API de eventos
├── index.html          Página principal
├── css/
│   └── style.css       Estilos
├── pub/
│   └── js/
│       └── app.js      Lógica del cliente (fetch)
├── agenda/             Datos de la agenda
├── Dockerfile          Imagen Ubuntu + Node + Nginx
├── nginx.conf          Proxy inverso /lab05/ → Express
├── start.sh            Arranque de Nginx y Node en el contenedor
├── package.json
└── README.md
```

## API

| Método | Ruta                        | Acción                                   | Respuestas                 |
| ------ | --------------------------- | ---------------------------------------- | -------------------------- |
| GET    | `/api/eventos`              | Lista el árbol de eventos (solo títulos) | 200                        |
| GET    | `/api/eventos/:fecha/:hora` | Detalle de un evento                     | 200, 404                   |
| POST   | `/api/eventos`              | Crea un evento                           | 201, 400, 409 si ya existe |
| PUT    | `/api/eventos/:fecha/:hora` | Edita título y descripción               | 200, 400, 404              |
| DELETE | `/api/eventos/:fecha/:hora` | Elimina un evento                        | 200, 404                   |

Formatos: fecha `AAAA-MM-DD` y hora `HH-MM` (por ejemplo, `2026-10-21` y `10-00`).

## Ejecución en local

Requisitos: NodeJS 18 o superior.

```bash
npm install
node index.js
```

Abrir http://localhost:3000

Ejemplos de prueba con `curl`:

```bash
curl -i -X POST localhost:3000/api/eventos -H "Content-Type: application/json" -d '{"fecha":"2026-10-21","hora":"10-00","titulo":"Reunion de laboratorio","descripcion":"Revisar avance"}'
curl -i localhost:3000/api/eventos
curl -i localhost:3000/api/eventos/2026-10-21/10-00
curl -i -X PUT localhost:3000/api/eventos/2026-10-21/10-00 -H "Content-Type: application/json" -d '{"titulo":"Reunion cambiada","descripcion":"Nueva descripcion"}'
curl -i -X DELETE localhost:3000/api/eventos/2026-10-21/10-00
```

## Ejecución con Docker + Nginx (producción)

Requisitos: Docker.

```bash
docker build -t lab05-agenda .
docker run -d --name lab05 -p 8084:80 lab05-agenda
```

Abrir http://127.0.0.1:8084/lab05/

El contenedor usa Ubuntu 24.04 con NodeJS y Nginx. Nginx escucha en el puerto 80 del contenedor (8084 en el anfitrión) y reenvía las peticiones de `/lab05/` a Express, que corre en el puerto 3000 dentro del contenedor.
