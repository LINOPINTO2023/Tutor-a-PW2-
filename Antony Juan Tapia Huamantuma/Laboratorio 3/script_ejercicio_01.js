document.body.innerHTML = `
    <div class="contenedor">

        <h1>Teclado Random</h1>

        <p>Ingrese su clave utilizando el teclado:</p>

        <div class="panel">

            <input
                type="password"
                id="clave"
                readonly
                placeholder="Ingrese su clave"
            >

            <div id="teclado"></div>

            <div class="botones">
                <button id="limpiar" type="button">
                    Limpiar
                </button>

                <button id="nuevoTeclado" type="button">
                    Ingresar
                </button>
            </div>

        </div>

    </div>
`;

// Estilos generales
document.body.style.margin = "0";
document.body.style.minHeight = "100vh";
document.body.style.display = "flex";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.backgroundColor = "#f3f3f3";

// Estilos del contenedor
const contenedor = document.querySelector(".contenedor");

contenedor.style.textAlign = "center";

// Crear los números
let numeros = [
    0, 1, 2, 3, 4,
    5, 6, 7, 8, 9
];

// Función para mezclar los números
function mezclarNumeros(array) {

    for (let i = array.length - 1; i > 0; i--) {

        let posicionAleatoria =
            Math.floor(Math.random() * (i + 1));

        let temporal = array[i];

        array[i] = array[posicionAleatoria];

        array[posicionAleatoria] = temporal;
    }
}

// Mezclar los números
mezclarNumeros(numeros);

// Obtener elementos
const teclado =
    document.getElementById("teclado");

const clave =
    document.getElementById("clave");

const botonLimpiar =
    document.getElementById("limpiar");

const botonNuevoTeclado =
    document.getElementById("nuevoTeclado");

// Panel de la calculadora
const panel =
    document.querySelector(".panel");

panel.style.width = "330px";
panel.style.padding = "20px";
panel.style.backgroundColor = "#202020";
panel.style.borderRadius = "10px";
panel.style.boxShadow =
    "0 5px 20px rgba(0, 0, 0, 0.3)";
panel.style.boxSizing = "border-box";

// Título
const titulo =
    document.querySelector("h1");

titulo.style.marginBottom = "10px";

// Texto
const texto =
    document.querySelector("p");

texto.style.color = "#333";

// Pantalla de la clave
clave.style.width = "100%";
clave.style.height = "60px";
clave.style.padding = "10px";
clave.style.boxSizing = "border-box";

clave.style.fontSize = "28px";
clave.style.textAlign = "right";

clave.style.color = "white";
clave.style.backgroundColor = "#151515";

clave.style.border = "none";
clave.style.borderRadius = "5px";

clave.style.outline = "none";

clave.style.marginBottom = "15px";

// Teclado
teclado.style.display = "grid";

teclado.style.gridTemplateColumns =
    "repeat(3, 1fr)";

teclado.style.gap = "6px";

teclado.style.width = "100%";

// Crear los botones
numeros.forEach(function(numero, indice) {

    const boton =
        document.createElement("button");

    boton.innerHTML = numero;

    boton.setAttribute("type", "button");

    // Estilo del botón
    boton.style.height = "55px";

    boton.style.fontSize = "20px";

    boton.style.color = "white";

    boton.style.backgroundColor = "#333333";

    boton.style.border = "none";

    boton.style.borderRadius = "5px";

    boton.style.cursor = "pointer";

    // El número 0 queda centrado abajo
    if (indice === 9) {

        boton.style.gridColumn = "2";
    }

    // Efecto al pasar el mouse
    boton.addEventListener("mouseenter", function() {

        boton.style.backgroundColor = "#444444";

    });

    boton.addEventListener("mouseleave", function() {

        boton.style.backgroundColor = "#333333";

    });

    // Al presionar un número
    boton.addEventListener("click", function() {

        clave.value =
            clave.value + numero;

    });

    teclado.appendChild(boton);

});

// Contenedor de botones inferiores
const botones =
    document.querySelector(".botones");

botones.style.display = "grid";

botones.style.gridTemplateColumns =
    "1fr 1fr";

botones.style.gap = "6px";

botones.style.marginTop = "10px";

// Botón Limpiar
botonLimpiar.style.height = "50px";

botonLimpiar.style.fontSize = "16px";

botonLimpiar.style.color = "white";

botonLimpiar.style.backgroundColor = "#8b0000";

botonLimpiar.style.border = "none";

botonLimpiar.style.borderRadius = "5px";

botonLimpiar.style.cursor = "pointer";

// Botón Nuevo teclado
botonNuevoTeclado.style.height = "50px";

botonNuevoTeclado.style.fontSize = "16px";

botonNuevoTeclado.style.color = "white";

botonNuevoTeclado.style.backgroundColor = "#0067c0";

botonNuevoTeclado.style.border = "none";

botonNuevoTeclado.style.borderRadius = "5px";

botonNuevoTeclado.style.cursor = "pointer";

// Limpiar la clave
botonLimpiar.addEventListener("click", function() {

    clave.value = "";

});

// Crear un nuevo teclado
botonNuevoTeclado.addEventListener("click", function() {

    location.reload();

});