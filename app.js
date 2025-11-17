

const STORAGE_KEY = "carrito_indumentaria";
const IVA = 0.21;
let productos = [];            
let carrito = cargarCarrito();
let descuento = 0;

const select = (sel) => document.querySelector(sel);
const formatPrecio = (n) => n.toLocaleString("es-AR");

function cargarProductos() {
    return fetch("./productos.json")
        .then((res) => {
            if (!res.ok) throw new Error("No se pudo cargar productos.json");
            return res.json();
        });
}

function renderCatalogo(lista = productos) {
    const cont = select("#catalogo");
    cont.innerHTML = "";
    lista.forEach((p) => {
        const el = document.createElement("div");
        el.className = "card";
        el.innerHTML = `
        <h3>${p.nombre}</h3>
        <div class="muted">${p.categoria} · Talles ${p.talle}</div>
        <div class="row">
        <strong>$${formatPrecio(p.precio)}</strong>
        <button data-id="${p.id}" class="btn-add">Agregar</button>
        </div>
    `;
        cont.appendChild(el);
    });
}

function renderCarrito() {
    const cont = select("#carrito");
    if (!carrito.length) {
        cont.innerHTML = `<p class="muted">No agregaste productos.</p>`;
    } else {
        cont.innerHTML = carrito
            .map(
                (item) => `
        <div class="item">
            <div>
            <div><strong>${item.nombre}</strong></div>
            <div class="muted">
                $${formatPrecio(item.precio)} · ${item.talle || "Talle único"}
            </div>
            </div>
            <div class="qty">
            <button class="menos" data-id="${item.id}">−</button>
            <span>${item.cantidad}</span>
            <button class="mas" data-id="${item.id}">+</button>
            <button class="quitar danger ghost" data-id="${item.id}">Quitar</button>
            </div>
        </div> `
            )
            .join("");
    }

    // Totales
    const sub = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const total = Math.max(0, sub - descuento);
    select("#subtotal").textContent = formatPrecio(sub);
    select("#descuento").textContent = formatPrecio(descuento);
    select("#total").textContent = formatPrecio(total);

    const cant = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    select("#badge").textContent = cant;
}

// LÓGICA

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
        Swal.fire({
            icon: "error",
            title: "Cupón inválido",
            text: "Revisá el código ingresado.",
            confirmButtonText: "Aceptar"
        });
    } else {
        descuento = Math.round(sub * pct);
        Swal.fire({
            icon: "success",
            title: "Cupón aplicado",
            html: `<p><strong>${key}</strong> -${pct * 100}%</p>
                <p>Descuento: $${formatPrecio(descuento)}</p>`,
            timer: 2000,
            showConfirmButton: false
        });
    }

    renderCarrito();
}

function vaciar() {
    if (!carrito.length) {
        Swal.fire({
            icon: "info",
            title: "El carrito ya está vacío",
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }

    Swal.fire({
        title: "¿Vaciar carrito?",
        text: "Se eliminarán todos los productos del carrito.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            descuento = 0;
            persistir();
            renderCarrito();

            Swal.fire({
                icon: "success",
                title: "se vacio el Carrito",
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function finalizar() {
    if (!carrito.length) {
        Swal.fire({
            icon: "info",
            title: "Carrito vacío",
            text: "Agregá productos antes de finalizar la compra.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    const sub = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
    const total = Math.max(0, sub - descuento);
    const iva = Math.round(total * IVA);
    const items = carrito.reduce((a, i) => a + i.cantidad, 0);

    Swal.fire({
        icon: "success",
        title: "Gracias por tu compra 🧾",
        html: `
            <p><strong>Ítems:</strong> ${items}</p>
            <p><strong>Subtotal:</strong> $${formatPrecio(sub)}</p>
            <p><strong>Descuento:</strong> $${formatPrecio(descuento)}</p>
            <p><strong>Total:</strong> $${formatPrecio(total)}</p>
            <p class="muted">IVA (21%) ref.: $${formatPrecio(iva)}</p>
        `,
        confirmButtonText: "Aceptar"
    }).then(() => {
        carrito = [];
        descuento = 0;
        persistir();
        renderCarrito();
    });
}

// LOCALSTORAGE

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

// EVENTOS

function wire() {
    // catálogo
    select("#catalogo").addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-add");
        if (btn) agregarAlCarrito(Number(btn.dataset.id));
    });

    // carrito
    select("#carrito").addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        if (e.target.classList.contains("mas")) cambiarCantidad(id, +1);
        if (e.target.classList.contains("menos")) cambiarCantidad(id, -1);
        if (e.target.classList.contains("quitar")) quitarItem(id);
    });

    // cupón
    select("#aplicar").addEventListener("click", () =>
        aplicarCupon(select("#cupon").value)
    );

    // filtro catálogo
    select("#filtro").addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        const filtrados = productos.filter((p) =>
            [p.nombre, p.categoria, p.talle].join(" ").toLowerCase().includes(q)
        );
        renderCatalogo(filtrados);
    });

    // botones carrito
    select("#vaciar").addEventListener("click", vaciar);
    select("#finalizar").addEventListener("click", finalizar);
}

// INIT

function init() {
    cargarProductos()
        .then((data) => {
            productos = data;
            renderCatalogo();
            renderCarrito();
            wire();
        })
        .catch((err) => {
            Swal.fire({
                icon: "error",
                title: "Error al cargar los productos",
                text: "Intentalo más tarde.",
                confirmButtonText: "Aceptar"
            });
        });
}

init();