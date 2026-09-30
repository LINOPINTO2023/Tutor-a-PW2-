// Palabras que puede elegir el juego
let palabras = [
    "JAVASCRIPT",
    "COMPUTADORA",
    "TECLADO",
    "PROGRAMACION",
    "INTERNET"
];

// Elegir una palabra al azar
let palabra =
    palabras[Math.floor(Math.random() * palabras.length)];

// Letras que ya fueron utilizadas
let letrasUsadas = [];

// Cantidad de errores
let errores = 0;

// Obtener elementos del HTML
const canvas =
    document.getElementById("canvas");

const contexto =
    canvas.getContext("2d");

const palabraElemento =
    document.getElementById("palabra");

const mensaje =
    document.getElementById("mensaje");

const letrasElemento =
    document.getElementById("letras");

const nuevoJuego =
    document.getElementById("nuevoJuego");


// Mostrar la palabra
function mostrarPalabra() {

    let texto = "";

    for (let i = 0; i < palabra.length; i++) {

        if (letrasUsadas.includes(palabra[i])) {

            texto += palabra[i] + " ";

        } else {

            texto += "_ ";

        }
    }

    palabraElemento.textContent = texto;
}


// Crear los botones de letras
function crearLetras() {

    letrasElemento.innerHTML = "";

    for (let i = 65; i <= 90; i++) {

        let letra =
            String.fromCharCode(i);

        let boton =
            document.createElement("button");

        boton.textContent = letra;

        boton.type = "button";

        // Evento onclick
        boton.onclick = function() {

            intentarLetra(letra);

            boton.disabled = true;
        };

        letrasElemento.appendChild(boton);
    }
}


// Intentar una letra
function intentarLetra(letra) {

    letrasUsadas.push(letra);

    // Comprobar si la letra está en la palabra
    if (palabra.includes(letra)) {

        mostrarPalabra();

        comprobarVictoria();

    } else {

        errores++;

        dibujarAhorcado();

        comprobarDerrota();
    }
}


// Dibujar una parte del ahorcado
function dibujarAhorcado() {

    contexto.lineWidth = 4;
    contexto.strokeStyle = "#000000";

    // Error 1: base
    if (errores === 1) {

        contexto.beginPath();

        contexto.moveTo(50, 220);
        contexto.lineTo(300, 220);

        contexto.stroke();
    }

    // Error 2: poste
    if (errores === 2) {

        contexto.beginPath();

        contexto.moveTo(100, 220);
        contexto.lineTo(100, 30);

        contexto.stroke();
    }

    // Error 3: parte superior
    if (errores === 3) {

        contexto.beginPath();

        contexto.moveTo(100, 30);
        contexto.lineTo(230, 30);

        contexto.stroke();
    }

    // Error 4: cuerda
    if (errores === 4) {

        contexto.beginPath();

        contexto.moveTo(230, 30);
        contexto.lineTo(230, 60);

        contexto.stroke();
    }

    // Error 5: cabeza
    if (errores === 5) {

        contexto.beginPath();

        contexto.arc(
            230,
            85,
            25,
            0,
            Math.PI * 2
        );

        contexto.stroke();
    }

    // Error 6: cuerpo
    if (errores === 6) {

        contexto.beginPath();

        contexto.moveTo(230, 110);
        contexto.lineTo(230, 170);

        contexto.stroke();
    }

    // Error 7: brazo izquierdo
    if (errores === 7) {

        contexto.beginPath();

        contexto.moveTo(230, 120);
        contexto.lineTo(190, 150);

        contexto.stroke();
    }

    // Error 8: brazo derecho
    if (errores === 8) {

        contexto.beginPath();

        contexto.moveTo(230, 120);
        contexto.lineTo(270, 150);

        contexto.stroke();
    }

    // Error 9: pierna izquierda
    if (errores === 9) {

        contexto.beginPath();

        contexto.moveTo(230, 170);
        contexto.lineTo(195, 205);

        contexto.stroke();
    }

    // Error 10: pierna derecha
    if (errores === 10) {

        contexto.beginPath();

        contexto.moveTo(230, 170);
        contexto.lineTo(265, 205);

        contexto.stroke();
    }
}


// Comprobar si ganó
function comprobarVictoria() {

    let gano = true;

    for (let i = 0; i < palabra.length; i++) {

        if (!letrasUsadas.includes(palabra[i])) {

            gano = false;
        }
    }

    if (gano) {

        mensaje.textContent =
            "¡Ganaste!";

        desactivarLetras();
    }
}


// Comprobar si perdió
function comprobarDerrota() {

    if (errores >= 10) {

        mensaje.textContent =
            "Perdiste. La palabra era: " + palabra;

        mostrarPalabra();

        desactivarLetras();
    }
}


// Desactivar todos los botones
function desactivarLetras() {

    let botones =
        letrasElemento.querySelectorAll("button");

    botones.forEach(function(boton) {

        boton.disabled = true;

    });
}


// Crear un nuevo juego
function nuevoJuegoFuncion() {

    palabra =
        palabras[
            Math.floor(Math.random() * palabras.length)
        ];

    letrasUsadas = [];

    errores = 0;

    contexto.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    mensaje.textContent =
        "Seleccione una letra";

    mostrarPalabra();

    crearLetras();
}


// Botón Nuevo juego
nuevoJuego.onclick = function() {

    nuevoJuegoFuncion();

};


// Iniciar el juego
mostrarPalabra();

crearLetras();