// producto.js · iconos de línea para las maquetas de producto. Se carga con <script src="producto.js" defer></script>
// y se usan así: <svg class="i"><use href="#i-buscar"/></svg> (24x24, trazo 1,75, puntas redondas, currentColor).
// Mismo fichero en producto-en-contexto, piezas-graficas y carrusel-instagram (junto a producto.css).
// Para añadir uno: dibújalo en una rejilla de 24 con trazo, sin rellenos (salvo puntos), y ponlo en la lista.
(() => {
  const iconos = {
    buscar: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    inicio: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
    factura: '<path d="M14.5 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V7.5z"/><path d="M14.5 3.5v4h4M8.8 12h6.4M8.8 15.5h4.2"/>',
    presupuesto: '<rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5v-.7a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8v.7M9 11h6M9 15h4"/>',
    clientes: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6M15.5 5.6a3 3 0 0 1 0 5.8M17.6 14.7c1.5.6 2.5 2 2.9 4.3"/>',
    usuario: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>',
    gastos: '<path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h11v3"/><rect x="4.5" y="8" width="15.5" height="11" rx="2"/><path d="M16 13.5h.01"/>',
    informes: '<path d="M5 20V11M10 20V5M15 20v-6M20 20V9"/>',
    ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    cerrar: '<path d="m6 6 12 12M18 6 6 18"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    campana: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'check-circulo': '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.8-4.8"/>',
    tarjeta: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    enviar: '<path d="M20.5 3.5 10.8 13.2M20.5 3.5l-6.2 17-3.5-7.3-7.3-3.5z"/>',
    carpeta: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    abajo: '<path d="m7 10 5 5 5-5"/>',
    derecha: '<path d="m10 7 5 5-5 5"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    rejilla: '<circle cx="7.5" cy="7.5" r="3"/><circle cx="16.5" cy="7.5" r="3"/><circle cx="7.5" cy="16.5" r="3"/><circle cx="16.5" cy="16.5" r="3"/>',
    panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>',
    filtro: '<path d="M4 6.5h16M7 12h10M10 17.5h4"/>',
    calendario: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/>',
    puntos: '<circle cx="12" cy="5.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none"/>',
    enlace: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    candado: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    mensaje: '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-8L6.5 20.5v-3H5A1.5 1.5 0 0 1 3.5 16V7A1.5 1.5 0 0 1 5 5.5z"/>',
    correo: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
    rayo: '<path d="M13 3 5.5 13.5h6L10.5 21 18 10.5h-6z"/>',
    repetir: '<path d="M4.5 11.5a7.5 7.5 0 0 1 13-4.6l2 2.1M19.5 4.5V9H15M19.5 12.5a7.5 7.5 0 0 1-13 4.6l-2-2.1M4.5 19.5V15H9"/>',
    descarga: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
    nube: '<path d="M7.5 18.5h9.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 9.6 4.5 4.5 0 0 0 7.5 18.5z"/>',
    estrella: '<path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>',
    escudo: '<path d="M12 3.5 19 6v5.5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6z"/>',
    grafico: '<path d="M4 17.5 9.5 12l3.5 3.5L20 8.5"/><path d="M15 8.5h5v5"/>',
    archivo: '<rect x="4" y="4.5" width="16" height="4.5" rx="1.5"/><path d="M5.5 9v9a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4"/>',
    editar: '<path d="M15.5 4.5 19.5 8.5 9 19H5v-4z"/><path d="m13.5 6.5 4 4"/>'
  }
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${Object.entries(iconos).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`
  document.body.insertAdjacentHTML('afterbegin', sprite)

  // Capa encima de su fila: <div class="flotante destacada" data-sobre=".ui-fila.oculta"> se centra en vertical sobre
  // esa fila de su misma pieza (la fila se deja con .oculta para que no asome). Se recalcula cuando cambia la fuente;
  // exportar.mjs lo vuelve a llamar después de aplicar la marca.
  window.recolocar = () => {
    for (const capa of document.querySelectorAll('[data-sobre]')) {
      const pieza = capa.closest('[data-pieza]') ?? document.body
      const fila = pieza.querySelector(capa.dataset.sobre)
      const base = capa.offsetParent
      if (!fila || !base) continue
      const rf = fila.getBoundingClientRect(), rb = base.getBoundingClientRect()
      capa.style.top = `${Math.round(rf.top - rb.top + rf.height / 2 - capa.offsetHeight / 2)}px`
    }
  }
  document.fonts.ready.then(window.recolocar)
})()
