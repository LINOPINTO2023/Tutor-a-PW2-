// Pila donde se guardarán las operaciones
let pila = [];

// Agregar números u operadores a la pantalla
function agregar(valor) {
    document.getElementById("pantalla").value += valor;
}

// Borrar la pantalla
function borrar() {
    document.getElementById("pantalla").value = "";
}

// Realizar la operación
function calcular() {
    let pantalla = document.getElementById("pantalla");
    let operacion = pantalla.value;

    // Comprobar que haya una operación
    if (operacion === "") {
        return;
    }

    try {

        // Realizar la operación utilizando eval()
        let resultado = eval(operacion);

        // Guardar la operación en la pila
        pila.push(operacion + " = " + resultado);

        // Mostrar el resultado
        pantalla.value = resultado;

        // Mostrar la pila
        mostrarPila();

    } catch (error) {

        pantalla.value = "Error";

    }
}

// Mostrar las operaciones guardadas en la pila
function mostrarPila() {
    let elementoPila = document.getElementById("pila");

    // Limpiar el contenido anterior
    elementoPila.innerHTML = "";

    // Mostrar desde la última operación hasta la primera
    for (let i = pila.length - 1; i >= 0; i--) {

        let elemento = document.createElement("p");

        elemento.textContent = pila[i];

        elementoPila.appendChild(elemento);
    }
}