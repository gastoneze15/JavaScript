
/*
PRE-ENTREGA CODERHOUSE – SIMULADOR DE COMPRA
Alumno: Brecciaroli Gaston

Idea general del simulador:
Este proyecto simula un proceso básico de compra en un carrito virtual.
El/la usuaria puede agregar productos desde un catálogo, elegir cantidades,
aplicar un cupón de descuento y obtener un resumen final con subtotal,
descuento aplicado y total a pagar (incluyendo IVA).  */

//VARIABLES, CONSTANTES Y ARRAYS
const IVA = 0.21; // Constante de IVA (ejemplo)

const catalogo = [
    { id: 1, nombre: 'Remera básica', precio: 12000 },
    { id: 2, nombre: 'Jean slim', precio: 38000 },
    { id: 3, nombre: 'Campera sport', precio: 65000 },
    { id: 4, nombre: 'Zapatillas', precio: 73000 },
];

// Carrito vacío inicialmente
let carrito = [];

//FUNCIONES QUE GENERAN INTERACCIÓN

function mostrarCatalogo() {
    console.clear();
    console.log('CATÁLOGO DISPONIBLE');
    console.table(catalogo);
}

function agregarProductos() {
    let seguir = true;
    while (seguir) {
        mostrarCatalogo();
        const input = prompt('Ingresá el ID del producto a agregar (o Cancelar para terminar).');
        if (input === null) break;

        const id = Number(input.trim());
        const producto = catalogo.find(p => p.id === id);

        if (!producto) {
            alert('⚠️ ID inválido. Probá otra vez.');
            continue;
        }

        const cantInput = prompt(`¿Cuántas unidades de "${producto.nombre}" querés?`);
        if (cantInput === null) continue;

        const cantidad = Math.max(1, Number(cantInput));
        carrito.push({ ...producto, cantidad });
        console.log(`+ Agregado: ${producto.nombre} x${cantidad}`);

        seguir = confirm('¿Querés agregar otro producto?');
    }
}

function calcularSubtotal() {
    return carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
}

function aplicarCupon(subtotal) {
    const cupones = { DESC10: 0.10, DESC20: 0.20 };
    const usar = confirm('¿Tenés un cupón de descuento?');
    if (!usar) return { total: subtotal, aplicado: 0 };

    const codigo = prompt('Ingresá el código de cupón (ej: DESC10 / DESC20)');
    if (!codigo) return { total: subtotal, aplicado: 0 };

    const porcentaje = cupones[codigo.toUpperCase().trim()];
    if (!porcentaje) {
        alert('Cupón inválido. Se continúa sin descuento.');
        return { total: subtotal, aplicado: 0 };
    }

    const descuento = subtotal * porcentaje;
    const total = subtotal - descuento;
    return { total, aplicado: descuento };
}

function mostrarResumen(subtotal, descuento, total) {
    console.group('RESUMEN DE COMPRA');
    console.table(carrito.map(p => ({ Producto: p.nombre, Cantidad: p.cantidad, Unitario: p.precio, Subtotal: p.precio * p.cantidad })));
    console.log('Subtotal: $' + subtotal.toFixed(2));
    console.log('Descuento aplicado: $' + descuento.toFixed(2));
    console.log('Total final: $' + total.toFixed(2));
    console.log('IVA (21%) referencia: $' + (total * IVA).toFixed(2));
    console.groupEnd();

    alert(`🧾 Resumen de compra\nSubtotal: $${subtotal}\nDescuento: -$${descuento}\nTotal final: $${total}`);
}

// FUNCIÓN PRINCIPAL (invocación)

function iniciarSimulador() {
    carrito = [];
    agregarProductos();
    if (carrito.length === 0) {
        alert('No se agregaron productos. ¡Volvé pronto!');
        return;
    }
    const subtotal = calcularSubtotal();
    const { total, aplicado } = aplicarCupon(subtotal);
    mostrarResumen(subtotal, aplicado, total);
}

//EJECUTAR
iniciarSimulador();
