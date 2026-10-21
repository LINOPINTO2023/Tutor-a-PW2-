# Guía para el informe — Laboratorio 4: Node.js y AJAX

Completa los datos personales y agrega capturas tomadas de tu propia ejecución. La guía no reemplaza el formato oficial que solicite el docente.

## 1. Objetivo
Desarrollar una aplicación web de una sola página para administrar una agenda personal mediante Node.js, Express y solicitudes asíncronas desde el navegador.

## 2. Tecnologías
- Node.js: entorno de ejecución de JavaScript en el servidor.
- Express: rutas HTTP y publicación de archivos estáticos.
- HTML y CSS: estructura y presentación.
- JavaScript Fetch API: solicitudes asíncronas al servidor.
- Sistema de archivos (`fs/promises`): almacenamiento de cada evento como archivo de texto.

## 3. Estructura del proyecto
Explica `server.js`, la carpeta `pub/` y `data/events/`. Inserta una captura del árbol de carpetas de tu editor.

## 4. Funcionamiento
Describe y agrega capturas de:
1. Vista principal y árbol de eventos.
2. Creación de un evento.
3. Mensaje al intentar duplicar fecha y hora.
4. Edición de un evento.
5. Eliminación de un evento.
6. Recarga de la página y persistencia de datos.

## 5. Fragmentos de código
Explica con numeración de líneas y capturas propias:
- `app.use(express.static(PUBLIC_DIR))`.
- La ruta `GET /api/events`.
- La ruta `POST /api/events` y la bandera `wx` que evita sobrescribir un archivo existente.
- Las rutas `PUT` y `DELETE`.
- La función `api()` de `pub/js/app.js`, que usa `fetch`.

## 6. Pregunta: XMLHttpRequest, jQuery.ajax y Fetch

**XMLHttpRequest (XHR):** es una API del navegador que permite hacer solicitudes HTTP asíncronas. Su interfaz tradicional utiliza eventos y callbacks, por ejemplo `onload`.

**jQuery.ajax():** es un método de la biblioteca jQuery. Simplifica la configuración de solicitudes y ofrece callbacks como `success` y `error`; requiere incluir jQuery.

**Fetch API:** es una API moderna del navegador que devuelve una promesa y se combina con `then()` o `async/await`. No necesita una biblioteca externa. Hay que comprobar `response.ok`, porque una respuesta HTTP como 404 no rechaza automáticamente la promesa.

Ejemplo equivalente para solicitar `/api/saludo`:

### XMLHttpRequest
```javascript
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/saludo");
xhr.onload = () => {
  if (xhr.status >= 200 && xhr.status < 300) {
    console.log(xhr.responseText);
  } else {
    console.error("Error HTTP:", xhr.status);
  }
};
xhr.onerror = () => console.error("Error de red");
xhr.send();
```

### jQuery.ajax
```javascript
$.ajax({
  url: "/api/saludo",
  method: "GET",
  success: data => console.log(data),
  error: xhr => console.error("Error HTTP:", xhr.status)
});
```
Este ejemplo requiere cargar jQuery en la página.

### Fetch
```javascript
fetch("/api/saludo")
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  })
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

**Conclusión:** XHR es una API clásica basada en eventos; jQuery.ajax ofrece una capa de conveniencia que depende de jQuery; Fetch usa promesas y suele resultar más legible con `async/await`. Para un proyecto nuevo sin dependencia de jQuery, Fetch es una opción apropiada.

Nota: los tres ejemplos muestran la misma idea de solicitud GET; para ejecutarlos literalmente, crea una ruta `/api/saludo` en `server.js` que responda con texto, por ejemplo `app.get("/api/saludo", (req, res) => res.send("Hola Mundo"));`.

## 7. Repositorio y commits
Crea tu propio repositorio y registra avances pequeños con mensajes claros. Adjunta capturas reales del historial de Git y explica qué cambió en cada commit.

## 8. Conclusiones
Redacta conclusiones propias basadas en lo que lograste implementar y probar.
