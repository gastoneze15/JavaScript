
const STORAGE_KEY = "carrito_indumentaria";
const IVA = 0.21; 

// Catálogo
const productos = [
    { id: 201, nombre: "Remera algodón oversize", categoria: "remeras", talle: "S-M-L-XL", precio: 14500 },
    { id: 202, nombre: "Remera básica cuello V", categoria: "remeras", talle: "S-M-L", precio: 12900 },
    { id: 203, nombre: "Top morley canelado", categoria: "tops", talle: "S-M-L", precio: 9800 },

    { id: 204, nombre: "Jean mom high rise", categoria: "jeans", talle: "36-46", precio: 45900 },
    { id: 205, nombre: "Jean wide leg", categoria: "jeans", talle: "36-46", precio: 49900 },
    { id: 206, nombre: "Pantalón sastrero", categoria: "pantalones", talle: "S-M-L", precio: 42900 },

    { id: 207, nombre: "Vestido midi floral", categoria: "vestidos", talle: "S-M-L", precio: 53900 },
    { id: 208, nombre: "Vestido camisero lino", categoria: "vestidos", talle: "S-M-L", precio: 58900 },

    { id: 209, nombre: "Buzo frisa capucha", categoria: "buzos", talle: "S-M-L-XL", precio: 33900 },
    { id: 210, nombre: "Sweater trenza", categoria: "sweaters", talle: "S-M-L", precio: 31900 },

    { id: 211, nombre: "Campera biker eco-cuero", categoria: "camperas", talle: "S-M-L", precio: 79900 },
    { id: 212, nombre: "Puffer corta", categoria: "camperas", talle: "S-M-L", precio: 89900 },

    { id: 213, nombre: "Zapatillas urbanas", categoria: "calzado", talle: "35-40", precio: 75900 },
    { id: 214, nombre: "Borcegos c/ plataforma", categoria: "calzado", talle: "35-40", precio: 89900 },

    { id: 215, nombre: "Cinto cuero ancho", categoria: "accesorios", talle: "Único", precio: 14900 },
    { id: 216, nombre: "Cartera bandolera", categoria: "accesorios", talle: "Único", precio: 42900 }
];

let carrito = cargarCarrito();
let descuento = 0;


const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const fmt = (n) => n.toLocaleString("es-AR");

//RENDER 

function renderCatalogo(lista = productos) {
    const cont = $("#catalogo");
    cont.innerHTML = "";
    lista.forEach((p) => {
        const el = document.createElement("div");
        el.className = "card";
        el.innerHTML = `
        <h3>${p.nombre}</h3>
        <div class="muted">${p.categoria} · Talles ${p.talle}</div>
        <div class="row">
        <strong>$${fmt(p.precio)}</strong>
        <button data-id="${p.id}" class="btn-add">Agregar</button>
        </div>
    `;
        cont.appendChild(el);
    });
}

function renderCarrito() {
    const cont = $("#carrito");
    if (!carrito.length) {
        cont.innerHTML = `<p class="muted">No agregaste productos.</p>`;
    } else {
        cont.innerHTML = carrito
            .map(
                (item) => `
        <div class="item">
        <div>
            <div><strong>${item.nombre}</strong></div>
            <div class="muted">$${fmt(item.precio)} · ${item.talle || "Talle único"
                    }</div>
        </div>
        <div class="qty">
            <button class="menos" data-id="${item.id}">−</button>
            <span>${item.cantidad}</span>
            <button class="mas" data-id="${item.id}">+</button>
            <button class="quitar danger ghost" data-id="${item.id
                    }">Quitar</button>
        </div>
        </div>
    `
            )
            .join("");
    }

    // Totales
    const sub = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const total = Math.max(0, sub - descuento);
    $("#subtotal").textContent = fmt(sub);
    $("#descuento").textContent = fmt(descuento);
    $("#total").textContent = fmt(total);


    const cant = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    $("#badge").textContent = cant;
}

//logica

function agregarAlCarrito(id) {
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    const found = carrito.find((i) => i.id === id);
    if (found) found.cantidad += 1;
    else carrito.push({ ...prod, cantidad: 1 });
    persistir();
    renderCarrito();
}

function cambiarCantidad(id, delta) {
    const item = carrito.find((i) => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter((i) => i.id !== id);
    }
    persistir();
    renderCarrito();
}

function quitarItem(id) {
    carrito = carrito.filter((i) => i.id !== id);
    persistir();
    renderCarrito();
}

function aplicarCupon(codigo) {
    const cupones = { ROXANA10: 0.10, ROXANA20: 0.20 };
    const key = (codigo || "").toUpperCase().trim();
    const pct = cupones[key];

    const sub = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
    if (!pct) {
        descuento = 0;
        alert("Cupón inválido o vacío.");
    } else {
        descuento = Math.round(sub * pct);
        alert(`Cupón aplicado: ${key} (−${pct * 100}%)`);
    }
    renderCarrito();
}

function vaciar() {
    carrito = [];
    descuento = 0;
    persistir();
    renderCarrito();
}

function finalizar() {
    if (!carrito.length) return alert("El carrito está vacío.");
    const sub = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
    const total = Math.max(0, sub - descuento);
    alert(
        `Gracias por tu compra 🧾\n` +
        `Ítems: ${carrito.reduce((a, i) => a + i.cantidad, 0)}\n` +
        `Subtotal: $${fmt(sub)}\n` +
        `Descuento: $${fmt(descuento)}\n` +
        `Total: $${fmt(total)}\n` +
        `IVA (21%) ref.: $${fmt(Math.round(total * IVA))}`
    );
}

// Lcoal Storage

function persistir() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}
function cargarCarrito() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}



function wire() {
    // Delegación en catálogo
    $("#catalogo").addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-add");
        if (btn) agregarAlCarrito(Number(btn.dataset.id));
    });

    // Delegación en carrito (+ / − / quitar)
    $("#carrito").addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        if (e.target.classList.contains("mas")) cambiarCantidad(id, +1);
        if (e.target.classList.contains("menos")) cambiarCantidad(id, -1);
        if (e.target.classList.contains("quitar")) quitarItem(id);
    });

    // Cupón
    $("#aplicar").addEventListener("click", () =>
        aplicarCupon($("#cupon").value)
    );

    // Filtro catálogo
    $("#filtro").addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        const filtrados = productos.filter((p) =>
            [p.nombre, p.categoria, p.talle].join(" ").toLowerCase().includes(q)
        );
        renderCatalogo(filtrados);
    });

    //Finalizar
    $("#vaciar").addEventListener("click", vaciar);
    $("#finalizar").addEventListener("click", finalizar);
}



function init() {
    renderCatalogo();
    renderCarrito();
    wire();
}
init();
