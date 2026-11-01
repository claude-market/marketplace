#!/usr/bin/env node
/**
 * exportar.mjs — pasa piezas HTML a PNG con un Chrome de verdad y revisa lo
 * que suele salir mal antes de que lo vea nadie.
 *
 * Uso:
 *   node exportar.mjs <fichero.html> [opciones]
 *
 * Opciones:
 *   --marca <json>     Marca que se aplica (colores, tipografía, nombre, web y logo). Si no se da y hay un
 *                      marca.json junto al HTML, se usa ese. Sin marca, se ven los valores de la plantilla.
 *   --selector <css>   Qué elementos son piezas (por defecto [data-pieza])
 *   --salida <dir>     Carpeta de salida (por defecto out/<nombre-del-html>/ junto al HTML)
 *   --escala <n>       Densidad de píxeles (1 = tamaño exacto; 2 = retina). Por defecto 1
 *   --solo <nombre>    Exporta solo la pieza con ese data-pieza
 *   --carrusel         Además de la hoja, genera perfil.png (cómo se ve en la rejilla 3:4 del perfil)
 *   --estricto         Sale con código 1 si hay avisos (no solo errores)
 *
 * La marca entra por variables CSS (--papel, --tinta, --acento, --fuente…, ver marca.json en la skill
 * direccion-de-arte; cada clave de «colores» pasa a --clave, y tipografia.display a --fuente-display)
 * y por elementos marcados: data-marca="nombre" | "web_texto" | "lema" | … (cualquier
 * campo de texto del JSON) y data-marca="logo" (se rellena con logo.svg, que usa currentColor).
 *
 * Cada pieza es un elemento con data-pieza="nombre" y, opcionalmente,
 * data-ancho / data-alto (se comprueba que mide eso), data-margen (zona segura
 * en px), data-min-letra (px) y data-permite-sombra (desactiva el aviso de
 * sombras y brillos). Dentro de la pieza, data-maqueta marca una maqueta de
 * interfaz (tarjeta, ventana): su texto puede ser más pequeño y entrar en el
 * margen, pero nunca salirse ni quedar cortado.
 *
 * Estilo «producto en contexto» (data-estilo="producto" en la pieza): valen las
 * sombras oscuras y suaves de las capas, pero se avisa de cualquier brillo
 * (sombra clara o de color, text-shadow) y de desenfocar el contexto. Las capas
 * de producto (cada [data-maqueta]) pueden solaparse entre ellas: es la
 * profundidad buscada; el texto libre (titular, apoyo, botón) no puede chocar
 * con ninguna. El texto dentro de .atenuado o [data-atenuado] es contexto
 * apagado a propósito: no se le mide el contraste ni la letra mínima.
 *
 * Looks (data-estilo en la pieza; el criterio de sombras y brillos de cada uno):
 *   (sin data-estilo)       plano: ni sombras, ni brillos, ni filtros.
 *   producto                sombras oscuras y suaves; ningún brillo; sin desenfoques.
 *   oscuro-glow             resplandor CON CONTENCIÓN: halos claros o de color con alfa ≤ 0,6 y
 *                           desenfoque ≤ 8 % del lado corto, en 3 elementos como mucho; sin text-shadow.
 *   producto-3d-mascota     como producto: sombras oscuras (contacto) sí; la luz de color va en las
 *                           imágenes y en el fondo, no en sombras de elementos.
 *   editorial-recorte       plano (el fundido de los recortes va con mask-image).
 *   tech-grid               plano.
 * En todos: [data-fondo] marca capas decorativas (rejilla, gráfico o dashboard desenfocado, bokeh,
 * partículas, líneas de construcción): dentro vale filter: blur() y su texto no se revisa ni cuenta
 * como bloque. <img data-recorte> es un sujeto o producto recortado: tiene que traer transparencia y
 * ningún texto puede pisar su parte opaca (se mide píxel a píxel, con la máscara de fundido si es
 * un linear-gradient vertical; data-sobre-recorte en el texto lo permite a propósito, p. ej. una
 * etiqueta de precio). Un titular con background-clip:text se mide con el tono más oscuro de su
 * degradado.
 *
 * Errores que detecta: tamaño distinto, texto fuera o cortado, textos que se
 * pisan, texto que choca con un bloque ajeno (tarjeta, botón), imágenes rotas,
 * fuentes que no cargan, un look con recortes (editorial-recorte, tech-grid,
 * producto-3d-mascota) sin al menos 2 <img data-recorte>. Avisos: margen, letra
 * mínima, contraste, sombras, imágenes ampliadas, viudas en titulares, halo claro
 * en el borde de un recorte, recortes que son rellenos planos (siluetas: error),
 * sujetos pequeños para el look, marcos o tarjetas de menos, textos o recortes de la
 * plantilla de ejemplo en la pieza de otra marca y entregas a menos de 2x.
 * Después de exportar, el bucle de pulido sigue con comparar.mjs (la pieza junto
 * a la golden del look; references/pulido.md).
 *
 * Salida: un PNG por pieza, hoja.png (todas juntas a tamaño de móvil, para
 * juzgar el ritmo) e informe.json. Lo que imprime por consola es el resumen.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
if (!args.length || args.includes('-h') || args.includes('--help')) {
  console.log(await readFile(new URL(import.meta.url), 'utf8').then(t => t.split('*/')[0]))
  process.exit(0)
}
const opt = (n, def) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : def }
const flag = n => args.includes(`--${n}`)

const fichero = path.resolve(args[0])
if (!existsSync(fichero)) { console.error(`No existe: ${fichero}`); process.exit(2) }
const selector = opt('selector', '[data-pieza]')
const salida = path.resolve(opt('salida', path.join(path.dirname(fichero), 'out', path.basename(fichero, path.extname(fichero)))))
const escala = Number(opt('escala', '1')) || 1
const solo = opt('solo', null)
const ficheroMarca = opt('marca', null) ? path.resolve(opt('marca')) : (existsSync(path.join(path.dirname(fichero), 'marca.json')) ? path.join(path.dirname(fichero), 'marca.json') : null)
let marca = null
if (ficheroMarca) {
  try { marca = JSON.parse(await readFile(ficheroMarca, 'utf8')) } catch (e) { console.error(`No puedo leer la marca ${ficheroMarca}: ${e.message}`); process.exit(2) }
}

// ── Marca ───────────────────────────────────────────────────────────────────
// Se ejecuta en el navegador: pone los tokens de la marca por encima de los de la plantilla,
// carga su tipografía y rellena nombre, web y logo.
async function aplicarMarcaEnPagina(m) {
  const c = m.colores || {}, t = m.tipografia || {}
  const vars = Object.entries(c).map(([k, v]) => `--${k}:${v}`)
  if (t.fuente) vars.push(`--fuente:'${t.fuente}', system-ui, sans-serif`)
  if (t.display) vars.push(`--fuente-display:'${t.display}', '${t.fuente ?? t.display}', system-ui, sans-serif`)
  if (t.mono) vars.push(`--mono:'${t.mono}', ui-monospace, monospace`)
  if (m.forma?.radio) vars.push(`--radio:${m.forma.radio}`)
  const st = document.createElement('style')
  st.id = 'marca-json'
  st.textContent = `:root{${vars.join(';')}}`
  document.head.appendChild(st)
  if (t.google_fonts) {
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = `https://fonts.googleapis.com/css2?${t.google_fonts}&display=block`
    await new Promise(r => { l.onload = l.onerror = r; document.head.appendChild(l) })
  }
  const leer = k => k.split('.').reduce((a, x) => (a == null ? a : a[x]), m)
  for (const el of document.querySelectorAll('[data-marca]')) {
    const k = el.dataset.marca
    if (k === 'logo') { if (m.logo?.svg) el.innerHTML = m.logo.svg }
    else { const v = leer(k); if (typeof v === 'string') el.textContent = v }
  }
  for (const fam of [t.fuente, t.display].filter(Boolean)) await Promise.all([300, 400, 500, 600, 700, 800].map(w => document.fonts.load(`${w} 40px "${fam}"`).catch(() => null)))
  await document.fonts.ready
  const cargada = fam => [...document.fonts].some(f => f.family.replace(/["']/g, '') === fam && f.status === 'loaded')
  return [t.fuente, t.display].filter(Boolean).filter(f => !cargada(f))
}

// ── Navegador ───────────────────────────────────────────────────────────────

async function abrirNavegador() {
  let pw
  for (const mod of ['playwright-core', 'playwright']) {
    try { pw = await import(mod); break } catch { /* siguiente */ }
  }
  if (!pw) {
    console.error('Falta playwright-core. Una sola vez, en la carpeta de este script:  npm install')
    process.exit(2)
  }
  const intentos = []
  if (process.env.CHROME_PATH) intentos.push({ executablePath: process.env.CHROME_PATH })
  intentos.push({ channel: 'chrome' }, { channel: 'msedge' }, {})
  let ultimo
  for (const o of intentos) {
    // --allow-file-access-from-files: deja leer los píxeles de los recortes locales (comprobación de transparencia)
    try { return await pw.chromium.launch({ headless: true, args: ['--allow-file-access-from-files'], ...o }) } catch (e) { ultimo = e }
  }
  console.error('No encuentro Chrome ni Edge. Instala Chrome, define CHROME_PATH o ejecuta: npx playwright install chromium')
  console.error(String(ultimo?.message ?? ultimo).split('\n')[0])
  process.exit(2)
}

// ── Revisión dentro de la página ────────────────────────────────────────────
// Se ejecuta en el navegador: mide lo que de verdad se ha pintado.

function revisarEnPagina({ selector, solo, escala, marcaNombre }) {
  // Cualquier color CSS (rgb, oklab, oklch, color(), color-mix ya calculado…) a rgba, con un lienzo de 1 px
  const lienzo = document.createElement('canvas'); lienzo.width = lienzo.height = 1
  const ctx = lienzo.getContext('2d', { willReadFrequently: true })
  const cache = new Map()
  const parse = s => {
    if (!s || s === 'none') return null
    if (cache.has(s)) return cache.get(s)
    let out = null
    const m = /^rgba?\(([^)]+)\)$/.exec(s.trim())
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
      out = { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }
    } else if (/^(oklab|oklch|lab|lch|color|hsla?|hwb)\(|^#|^transparent$/.test(s.trim())) {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = s; ctx.fillRect(0, 0, 1, 1)
      const d = ctx.getImageData(0, 0, 1, 1).data
      out = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }
    }
    cache.set(s, out)
    return out
  }
  // Capas de una sombra calculada: «color x y blur spread [inset]», separadas por comas fuera de paréntesis
  const capasSombra = s => s.split(/,(?![^(]*\))/).map(x => x.trim()).filter(Boolean).map(x => {
    const col = (x.match(/(rgba?|oklab|oklch|lab|lch|color|hsla?)\([^)]*\)/) || [])[0] || 'rgb(0, 0, 0)'
    const resto = x.replace(col, '')
    const n = resto.replace('inset', '').trim().split(/\s+/).map(parseFloat)
    return { color: parse(col), blur: n[2] || 0, inset: /inset/.test(resto) }
  })
  // Brillo = sombra difusa clara o de color vivo (las de profundidad son oscuras)
  const esBrillo = s => capasSombra(s).some(c => !c.inset && c.blur > 4 && c.color && c.color.a > 0.15 && lum(c.color) > 0.18)
  const raiz = el => el.closest('[data-maqueta]')
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
  const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
  const mezcla = (arriba, abajo) => ({
    r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
    g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
    b: arriba.b * arriba.a + abajo.b * (1 - arriba.a), a: 1,
  })
  // Colores de un valor calculado (paradas de un degradado, capas de sombra…)
  const coloresDe = s => (s.match(/(rgba?|oklab|oklch|lab|lch|color|hsla?)\([^)]*\)/g) || []).map(parse).filter(Boolean)
  const clipTexto = cs => /text/.test(`${cs.backgroundClip} ${cs.webkitBackgroundClip}`) && /gradient/.test(cs.backgroundImage)
  const fondoDe = el => {
    const capas = []
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/gradient/.test(cs.backgroundImage)) return { imagen: true }
      const c = parse(cs.backgroundColor)
      if (c && c.a > 0) { capas.push(c); if (c.a >= 0.99) break }
      else if (n !== el && /gradient/.test(cs.backgroundImage) && !clipTexto(cs)) {
        // Degradado sin color sólido debajo: se aproxima por la media de sus paradas (ponderada por su alfa)
        const cols = coloresDe(cs.backgroundImage)
        const s = cols.reduce((a, x) => ({ r: a.r + x.r * x.a, g: a.g + x.g * x.a, b: a.b + x.b * x.a, a: a.a + x.a }), { r: 0, g: 0, b: 0, a: 0 })
        if (s.a > 0) {
          const capa = { r: s.r / s.a, g: s.g / s.a, b: s.b / s.a, a: Math.min(1, s.a / cols.length) }
          capas.push(capa); if (capa.a >= 0.99) break
        }
      }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 }
    for (let i = capas.length - 1; i >= 0; i--) base = mezcla(capas[i], base)
    return { color: base }
  }
  const rectTexto = el => {
    let r = null
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue
      const rg = document.createRange(); rg.selectNodeContents(n)
      for (const q of rg.getClientRects()) {
        if (!q.width || !q.height) continue
        r = r ? { left: Math.min(r.left, q.left), top: Math.min(r.top, q.top), right: Math.max(r.right, q.right), bottom: Math.max(r.bottom, q.bottom) }
          : { left: q.left, top: q.top, right: q.right, bottom: q.bottom }
      }
    }
    return r
  }
  const corta = t => t.replace(/\s+/g, ' ').trim().slice(0, 48)
  const cruza = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

  const fuentesFallidas = [...document.fonts].filter(f => f.status === 'error').map(f => `${f.family} ${f.weight}`)

  const piezas = [...document.querySelectorAll(selector)]
    .filter(p => !solo || p.dataset.pieza === solo)
  return piezas.map((p, i) => {
    const nombre = p.dataset.pieza || p.id || `pieza-${String(i + 1).padStart(2, '0')}`
    const caja = p.getBoundingClientRect()
    const w = Math.round(caja.width), h = Math.round(caja.height)
    const errores = [], avisos = []
    const da = Number(p.dataset.ancho), dh = Number(p.dataset.alto)
    if (da && dh && (Math.abs(da - w) > 0.5 || Math.abs(dh - h) > 0.5)) errores.push(`Mide ${w}x${h} y debería medir ${da}x${dh}`)
    const margen = Number(p.dataset.margen) || Math.round(Math.min(w, h) * 0.045)
    const minLetra = Number(p.dataset.minLetra) || Math.max(14, Math.round(Math.min(w, h) * 0.02))
    const imagenes = [...p.querySelectorAll('img')]
    // Solo la parte visible de cada imagen: los recortes la desbordan pero el contenedor la oculta
    const visible = el => {
      let r = el.getBoundingClientRect(); r = { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
      for (let n = el.parentElement; n && n !== p.parentElement; n = n.parentElement) {
        const c = getComputedStyle(n)
        if (!/(hidden|clip)/.test(c.overflow + c.overflowX + c.overflowY)) continue
        const q = n.getBoundingClientRect()
        r = { left: Math.max(r.left, q.left), top: Math.max(r.top, q.top), right: Math.min(r.right, q.right), bottom: Math.min(r.bottom, q.bottom) }
      }
      return r
    }
    // Los recortes (data-recorte) no cuentan como foto de fondo: se miden píxel a píxel más abajo
    const rectImgs = imagenes.filter(im => !im.hasAttribute('data-recorte') && !im.closest('[data-fondo]')).map(visible).filter(r => r.right > r.left && r.bottom > r.top)

    for (const im of imagenes) {
      const r = im.getBoundingClientRect()
      if (!im.complete || im.naturalWidth === 0) errores.push(`Imagen rota: ${im.getAttribute('src')?.slice(0, 80)}`)
      else if (im.naturalWidth < r.width * escala * 0.95 && getComputedStyle(im).objectFit !== 'cover') {
        avisos.push(`Imagen con poca resolución (${im.naturalWidth}px para ${Math.round(r.width * escala)}px): ${im.getAttribute('src')?.slice(0, 60)}`)
      } else if (getComputedStyle(im).objectFit === 'cover') {
        const k = Math.max(r.width / im.naturalWidth, r.height / im.naturalHeight) * escala
        if (k > 1.05) avisos.push(`Imagen ampliada ${k.toFixed(2)}x (se verá blanda): ${im.getAttribute('src')?.slice(0, 60)}`)
      }
    }

    const vistos = new Set()
    const textos = []
    // Criterio de sombras y brillos del look (ver la cabecera)
    const look = p.dataset.estilo || ''
    const criterio = { producto: 'oscuras', 'producto-3d-mascota': 'oscuras', 'oscuro-glow': 'halo' }[look] ?? 'plano'
    const porque = { plano: 'en este estilo no van sombras ni brillos', oscuras: 'aquí solo valen sombras oscuras y suaves', halo: 'el resplandor va con contención' }[criterio]
    const maxHalo = Math.round(Math.min(w, h) * 0.08)
    const conHalo = new Set()
    for (const el of [p, ...p.querySelectorAll('*')]) {
      const cs = getComputedStyle(el)
      const decorado = !!el.closest('[data-fondo]')
      if (!p.hasAttribute('data-permite-sombra') && !decorado) {
        let brillo = null
        if (cs.textShadow !== 'none') brillo = 'text-shadow'
        else if (cs.boxShadow !== 'none') {
          if (criterio === 'plano') brillo = 'box-shadow'
          else if (criterio === 'oscuras') { if (esBrillo(cs.boxShadow)) brillo = 'box-shadow clara o de color' }
          else {
            const halos = capasSombra(cs.boxShadow).filter(c => !c.inset && c.blur > 4 && c.color && c.color.a > 0.15 && lum(c.color) > 0.18)
            if (halos.length) {
              conHalo.add(el)
              const fuerte = halos.find(c => c.color.a > 0.6 || c.blur > maxHalo)
              if (fuerte) brillo = `halo demasiado fuerte: alfa ${fuerte.color.a.toFixed(2)} y ${Math.round(fuerte.blur)} px de desenfoque; máximo 0,6 y ${maxHalo} px`
            }
          }
        }
        if (!brillo && /drop-shadow|blur/.test(cs.filter)) brillo = look === 'producto' ? 'filter: el contexto se atenúa, no se desenfoca' : 'filter: desenfoques y sombras de filtro solo en capas data-fondo'
        if (brillo && !vistos.has(brillo + el.tagName)) {
          vistos.add(brillo + el.tagName)
          avisos.push(`Sombra o brillo (${brillo}) en <${el.tagName.toLowerCase()} class="${el.className?.baseVal ?? el.className}">: ${porque}`)
        }
      }
      // Las capas decorativas (data-fondo) no se revisan como texto: son fondo
      if (decorado) continue
      const rt = rectTexto(el)
      if (!rt || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue
      const atenuado = !!el.closest('.atenuado, [data-atenuado]')
      const texto = corta(el.textContent)
      // Para los choques vale la caja de línea, no la del glifo (con interlineado < 1 el glifo se sale y no pisa nada)
      let bloque = el
      while (bloque !== p && getComputedStyle(bloque).display === 'inline') bloque = bloque.parentElement
      const bb = bloque.getBoundingClientRect()
      textos.push({ el, rt: { left: rt.left, right: rt.right, top: Math.max(rt.top, bb.top), bottom: Math.min(rt.bottom, bb.bottom) }, texto })
      if (rt.left < caja.left - 1 || rt.top < caja.top - 1 || rt.right > caja.right + 1 || rt.bottom > caja.bottom + 1) {
        errores.push(`Texto fuera de la pieza: «${texto}»`)
      } else if (!el.closest('[data-sin-margen], [data-maqueta]') && (rt.left - caja.left < margen || rt.top - caja.top < margen || caja.right - rt.right < margen || caja.bottom - rt.bottom < margen)) {
        avisos.push(`Texto dentro del margen de seguridad (${margen}px): «${texto}»`)
      }
      for (let n = el; n && n !== p.parentElement; n = n.parentElement) {
        const c2 = getComputedStyle(n)
        if (/(hidden|clip)/.test(c2.overflow + c2.overflowX + c2.overflowY) && (n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1) && n !== p) {
          errores.push(`Texto cortado por un contenedor: «${texto}»`); break
        }
      }
      const tam = parseFloat(cs.fontSize)
      const minimoAqui = el.closest('[data-maqueta]') ? Math.min(minLetra, Math.max(14, Math.round(Math.min(w, h) * 0.016))) : minLetra
      if (!atenuado && tam < minimoAqui) avisos.push(`Letra de ${Math.round(tam * 10) / 10}px (mínimo ${minimoAqui}px aquí): «${texto}»`)
      const sobreFoto = rectImgs.some(ri => cruza(ri, rt))
      const fondo = fondoDe(el)
      const color = parse(cs.color)
      if (atenuado) {
        // contexto apagado a propósito: ni contraste ni letra mínima
      } else if (sobreFoto || fondo.imagen) {
        if (!el.closest('[data-legible]')) avisos.push(`Texto sobre imagen, comprueba la legibilidad a ojo: «${texto}»`)
      } else if (color && fondo.color) {
        // Texto con degradado (background-clip:text): manda el tono más oscuro del degradado
        const degradado = clipTexto(cs) ? coloresDe(cs.backgroundImage) : []
        const c = degradado.length
          ? Math.min(...degradado.map(x => contraste(mezcla(x, fondo.color), fondo.color)))
          : contraste(mezcla(color, fondo.color), fondo.color)
        const grande = tam >= Math.min(w, h) * 0.04 || (tam >= Math.min(w, h) * 0.03 && Number(cs.fontWeight) >= 700)
        const minimo = grande ? 3 : 4.5
        if (c < minimo) avisos.push(`Contraste ${c.toFixed(2)}:1 (mínimo ${minimo}:1${degradado.length ? ', tono más oscuro del degradado' : ''}): «${texto}»`)
      }
    }
    if (criterio === 'halo' && conHalo.size > 3) avisos.push(`Demasiados resplandores: ${conHalo.size} elementos con halo (como mucho 3 por pieza)`)
    // Recortes (img[data-recorte]): tienen que traer transparencia y ningún texto puede pisar su parte opaca
    const mapas = []
    let cobertura = 0
    for (const im of imagenes.filter(x => x.hasAttribute('data-recorte'))) {
      if (!im.complete || !im.naturalWidth) continue
      const src = (im.getAttribute('src') || '').split('/').pop().slice(0, 60)
      const nw = im.naturalWidth, nh = im.naturalHeight
      const k = Math.min(1, 200 / Math.max(nw, nh))
      const gw = Math.max(1, Math.round(nw * k)), gh = Math.max(1, Math.round(nh * k))
      const cv = document.createElement('canvas'); cv.width = gw; cv.height = gh
      const cx = cv.getContext('2d', { willReadFrequently: true })
      let datos
      try { cx.drawImage(im, 0, 0, gw, gh); datos = cx.getImageData(0, 0, gw, gh).data } catch {
        avisos.push(`No puedo leer los píxeles del recorte ${src}: comprueba a ojo que trae transparencia y que ningún texto lo pisa`); continue
      }
      let transparentes = 0
      for (let i = 3; i < datos.length; i += 4) if (datos[i] < 20) transparentes++
      if (transparentes / (gw * gh) < 0.03) { errores.push(`El recorte no trae transparencia (¿fondo sin quitar?): ${src}`); continue }
      // Halo claro en el borde: el borde semitransparente, más claro que el sujeto pegado a él (restos del fondo)
      {
        const k2 = Math.min(1, 900 / Math.max(nw, nh)), hw = Math.max(1, Math.round(nw * k2)), hh = Math.max(1, Math.round(nh * k2))
        const cv2 = document.createElement('canvas'); cv2.width = hw; cv2.height = hh
        const c2 = cv2.getContext('2d', { willReadFrequently: true }); c2.drawImage(im, 0, 0, hw, hh)
        const d2 = c2.getImageData(0, 0, hw, hh).data
        // Cada píxel semitransparente del borde frente al opaco más cercano hacia dentro (local: una prenda blanca
        // o una luz de contorno real no cuentan; el gris del fondo pegado a un sujeto oscuro, sí)
        const L2 = i => 0.2126 * d2[i] + 0.7152 * d2[i + 1] + 0.0722 * d2[i + 2]
        let suma = 0, n2 = 0, claros = 0
        for (let y = 3; y < hh - 3; y++) for (let x = 3; x < hw - 3; x++) {
          const q = (y * hw + x) * 4, a = d2[q + 3]
          if (a < 40 || a > 200) continue
          let o = -1
          for (let rr = 1; rr <= 3 && o < 0; rr++) for (const [dx, dy] of [[rr, 0], [-rr, 0], [0, rr], [0, -rr], [rr, rr], [-rr, -rr], [rr, -rr], [-rr, rr]]) {
            const t = ((y + dy) * hw + x + dx) * 4; if (d2[t + 3] > 250) { o = t; break }
          }
          if (o < 0) continue
          const dl = L2(q) - L2(o); suma += dl; n2++; if (dl > 30) claros++
        }
        if (n2 > 200 && suma / n2 > 38 && claros / n2 > 0.55) avisos.push(`Halo claro en el borde del recorte ${src} (el ${Math.round(claros / n2 * 100)} % del borde es más claro que el sujeto): pásalo por preparar-recorte.mjs y míralo con ver-recorte.mjs`)
        // ¿Foto o render, o un relleno plano (silueta, figura dibujada)? Tonos distintos y textura del interior a 400 px
        const k3 = Math.min(1, 400 / Math.max(nw, nh)), w3 = Math.max(1, Math.round(nw * k3)), h3 = Math.max(1, Math.round(nh * k3))
        const cv3 = document.createElement('canvas'); cv3.width = w3; cv3.height = h3
        const c3 = cv3.getContext('2d', { willReadFrequently: true }); c3.drawImage(im, 0, 0, w3, h3)
        const d3 = c3.getImageData(0, 0, w3, h3).data, L3 = i => 0.2126 * d3[i] + 0.7152 * d3[i + 1] + 0.0722 * d3[i + 2]
        let n3 = 0, lap = 0; const tonos = new Set()
        for (let y = 3; y < h3 - 3; y++) for (let x = 3; x < w3 - 3; x++) {
          const q = (y * w3 + x) * 4
          if (d3[q + 3] < 250 || d3[q - 9] < 250 || d3[q + 15] < 250 || d3[q - w3 * 12 + 3] < 250 || d3[q + w3 * 12 + 3] < 250) continue
          n3++; lap += Math.abs(4 * L3(q) - L3(q - 4) - L3(q + 4) - L3(q - w3 * 4) - L3(q + w3 * 4))
          tonos.add((d3[q] >> 3) << 10 | (d3[q + 1] >> 3) << 5 | (d3[q + 2] >> 3))
        }
        if (n3 > 500 && (tonos.size < 60 || lap / n3 < 1.5)) errores.push(`El recorte ${src} es un relleno plano (${tonos.size} tonos): una silueta o figura dibujada no sustituye a una foto o un render del sujeto (sujetos.md)`)
      }
      let opacos = 0
      for (let i = 3; i < datos.length; i += 4) if (datos[i] > 128) opacos++
      const cs = getComputedStyle(im), r = im.getBoundingClientRect()
      { const v = visible(im); cobertura += opacos / (gw * gh) * Math.max(0, Math.min((v.right - v.left) * (v.bottom - v.top), r.width * r.height)) }
      // Dónde cae la imagen dentro de su caja (object-fit + object-position en %)
      const ajuste = cs.objectFit
      const s = ajuste === 'cover' ? Math.max(r.width / nw, r.height / nh) : (ajuste === 'contain' || ajuste === 'scale-down') ? Math.min(r.width / nw, r.height / nh) : null
      const dw = s ? nw * s : r.width, dh = s ? nh * s : r.height
      const [px, py] = (cs.objectPosition.match(/-?[\d.]+%/g) || ['50%', '50%']).map(v => parseFloat(v) / 100)
      const ox = r.left + (r.width - dw) * (px ?? 0.5), oy = r.top + (r.height - dh) * (py ?? 0.5)
      // Máscara de fundido (solo un linear-gradient vertical; si es otra cosa, no se descuenta)
      const mk = cs.maskImage && cs.maskImage !== 'none' ? cs.maskImage : (cs.webkitMaskImage || '')
      let mascara = () => 1
      if (/linear-gradient/.test(mk) && !/(to (left|right)|\d+deg)/.test(mk.replace(/(180|0)deg/g, ''))) {
        const arriba = /to top|(^|[^\d])0deg/.test(mk)
        const paradas = [...mk.matchAll(/((?:rgba?|oklab|oklch|color)\([^)]*\)|transparent|black|white|#[0-9a-f]{3,8})\s*([-\d.]+%)?/gi)]
          .map(([, col, pos], i, arr) => ({ a: parse(col === 'transparent' ? 'rgba(0,0,0,0)' : col)?.a ?? 1, t: pos ? parseFloat(pos) / 100 : i / Math.max(1, arr.length - 1) }))
        if (paradas.length > 1) mascara = y => {
          let t = (y - r.top) / r.height; if (arriba) t = 1 - t
          if (t <= paradas[0].t) return paradas[0].a
          for (let i = 1; i < paradas.length; i++) if (t <= paradas[i].t) {
            const a = paradas[i - 1], b = paradas[i]; return a.a + (b.a - a.a) * ((t - a.t) / Math.max(1e-6, b.t - a.t))
          }
          return paradas[paradas.length - 1].a
        }
      }
      mapas.push({ src, vis: visible(im), alfa: (x, y) => {
        const u = Math.floor((x - ox) / dw * gw), v = Math.floor((y - oy) / dh * gh)
        if (u < 0 || v < 0 || u >= gw || v >= gh) return 0
        return datos[(v * gw + u) * 4 + 3] / 255 * mascara(y) * Number(cs.opacity)
      } })
    }
    for (const t of textos) {
      if (t.el.closest('[data-sobre-recorte]')) continue
      for (const m of mapas) {
        const L = Math.max(t.rt.left, m.vis.left), R = Math.min(t.rt.right, m.vis.right)
        const T = Math.max(t.rt.top, m.vis.top), B = Math.min(t.rt.bottom, m.vis.bottom)
        if (R - L < 2 || B - T < 2) continue
        let total = 0, opacos = 0
        for (let y = T + 1; y < B; y += 3) for (let x = L + 1; x < R; x += 3) { total++; if (m.alfa(x, y) > 0.35) opacos++ }
        if (opacos > 2 && opacos / total > 0.02) { errores.push(`Texto encima de un recorte: «${t.texto.slice(0, 40)}» pisa ${m.src}`); break }
      }
    }
    // Choques: dos textos que no se contienen uno a otro y se pisan
    const pisa = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2
    for (let i = 0; i < textos.length; i++) for (let j = i + 1; j < textos.length; j++) {
      const a = textos[i], b = textos[j]
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue
      // Dos capas de producto distintas que se solapan: la de arriba tapa a la de abajo a propósito
      const ra = raiz(a.el), rb = raiz(b.el)
      if (ra && rb && ra !== rb) continue
      if (pisa(a.rt, b.rt)) errores.push(`Textos que se pisan: «${a.texto.slice(0, 30)}» y «${b.texto.slice(0, 30)}»`)
    }
    // Texto que choca con un bloque (tarjeta, botón, maqueta) que no es el suyo
    const bloques = [...p.querySelectorAll('*')].filter(b => {
      if (b.tagName === 'IMG' || b.tagName === 'svg' || b.closest('svg') || b.closest('[data-fondo]')) return false
      const c = getComputedStyle(b), bg = parse(c.backgroundColor)
      return (bg && bg.a > 0.05) || parseFloat(c.borderTopWidth) > 0 && parseFloat(c.borderLeftWidth) > 0
    }).map(b => ({ b, r: visible(b) }))
    for (const t of textos) {
      const rt0 = raiz(t.el)
      for (const { b, r } of bloques) {
        if (b.contains(t.el) || t.el.contains(b)) continue
        const rb = raiz(b)
        if (rt0 && rb && rt0 !== rb) continue
        if (pisa(t.rt, r)) { errores.push(`Texto que choca con un bloque <${b.tagName.toLowerCase()} class="${b.className}">: «${t.texto.slice(0, 40)}»`); break }
      }
    }
    // Bloques sin aire: dos tarjetas o botones que no se tocan pero quedan a menos de 24 px
    // (entre piezas de maquetas no se mide: es el espaciado de la interfaz o un solape buscado)
    for (let i = 0; i < bloques.length; i++) for (let j = i + 1; j < bloques.length; j++) {
      const A = bloques[i], B = bloques[j]
      if (A.b.contains(B.b) || B.b.contains(A.b)) continue
      if (raiz(A.b) && raiz(B.b)) continue
      const sx = Math.max(A.r.left, B.r.left) - Math.min(A.r.right, B.r.right)
      const sy = Math.max(A.r.top, B.r.top) - Math.min(A.r.bottom, B.r.bottom)
      const hueco = Math.max(sx, sy)
      if (hueco >= 0 && hueco < 24 && (sx < 0 || sy < 0)) {
        avisos.push(`Bloques sin aire (${Math.round(hueco)} px): <${A.b.tagName.toLowerCase()} class="${A.b.className}"> y <${B.b.tagName.toLowerCase()} class="${B.b.className}">`)
      }
    }
    // Viudas: un titular de varias líneas que acaba con una palabra sola
    for (const el of p.querySelectorAll('h1, h2, h3, [data-titular]')) {
      const palabras = []
      const recorrer = n => {
        if (n.nodeType === 3) {
          const re = /\S+/g; let mt
          while ((mt = re.exec(n.textContent))) {
            const rg = document.createRange(); rg.setStart(n, mt.index); rg.setEnd(n, mt.index + mt[0].length)
            const q = rg.getClientRects()[0]; if (q) palabras.push({ top: Math.round(q.top), left: q.left, right: q.right })
          }
        } else n.childNodes.forEach(recorrer)
      }
      recorrer(el)
      const lineas = [...new Set(palabras.map(x => x.top))].sort((x, y) => x - y)
      const ultima = palabras.filter(x => x.top === lineas[lineas.length - 1])
      // Una palabra sola y corta (< 45 % de la línea más ancha). «OPERA SIN / COMISIONES» es un corte buscado, no una viuda
      const ancho = l => { const ps = palabras.filter(x => x.top === l); return Math.max(...ps.map(x => x.right)) - Math.min(...ps.map(x => x.left)) }
      if (lineas.length > 1 && ultima.length === 1 && ancho(lineas[lineas.length - 1]) < 0.45 * Math.max(...lineas.map(ancho))) {
        avisos.push(`Viuda: el titular «${corta(el.textContent).slice(0, 40)}» acaba con una palabra sola en la última línea`)
      }
    }
    // ── Lo que separa una pieza amateur de la golden del look (bucle de pulido) ──
    const recortes = imagenes.filter(x => x.hasAttribute('data-recorte'))
    // Estructura mínima de cada look: sin sus sujetos, el look no existe
    const minRecortes = { 'editorial-recorte': 2, 'producto-3d-mascota': 2, 'tech-grid': 2 }[look]
    if (minRecortes && recortes.length < minRecortes) {
      errores.push(`El look ${look} se hace con fotos o renders recortados (<img data-recorte>, ${minRecortes} como mínimo; hay ${recortes.length}). No valen siluetas, dibujos ni formas en CSS/SVG: consigue el material (piezas-graficas/references/sujetos.md)`)
    }
    // Las medidas de composición son las del hero de la golden (16:9); el resto de formatos llevan menos
    const esHero = w / h > 1.5 && w / h < 2
    if (look === 'tech-grid' && esHero && p.querySelectorAll('.marco').length < 3) avisos.push('Menos de 3 marcos: la golden de tech-grid compone 3-4 marcos de proporciones distintas unidos por pistas. Con 2 productos, el tercero es una persona con el producto (IA o foto) u otro producto (librería 3D o IA); nunca una ampliación de la misma foto')
    // Fotos con su fondo dentro de la pieza (en los looks con recortes, cada sujeto va recortado)
    if (minRecortes) {
      const conFondo = imagenes.filter(x => !x.hasAttribute('data-recorte') && !x.closest('[data-fondo]') && x.getBoundingClientRect().width * x.getBoundingClientRect().height > w * h * 0.02)
      if (conFondo.length) avisos.push(`Foto sin recortar en la pieza (${conFondo.map(x => (x.getAttribute('src') || '').split('/').pop().slice(0, 40)).join(', ')}): en ${look} cada sujeto va recortado (<img data-recorte>); no rellenes marcos con ampliaciones o detalles de una foto`)
    }
    if (look === 'oscuro-glow' && p.querySelectorAll('.og-tarjeta').length !== 2) avisos.push(`Oscuro glow lleva 2 tarjetas con una cifra cada una (hay ${p.querySelectorAll('.og-tarjeta').length})`)
    if (look === 'producto' && !p.querySelector('[data-maqueta]')) avisos.push('Producto en contexto sin ninguna capa de interfaz [data-maqueta]: la pieza tiene que enseñar la app')
    if (!look && p.querySelector('.tg, .og-escena, .lienzo-3d, .editorial, .escena')) avisos.push('La pieza usa los componentes de un look pero no lleva data-estilo: el exportador no puede aplicar su criterio')
    // Sujetos pequeños: en las golden, los recortes ocupan una buena parte de la pieza
    const minCob = { 'producto-3d-mascota': 0.16, 'tech-grid': 0.1, 'editorial-recorte': 0.18 }[look]
    if (minCob && esHero && recortes.length && cobertura / (w * h) < minCob) avisos.push(`Los sujetos ocupan solo el ${Math.round(cobertura / (w * h) * 100)} % de la pieza (en la golden de ${look}, más del ${Math.round(minCob * 100)} %): hazlos más grandes o acércalos`)
    // Restos de la plantilla de ejemplo cuando la marca es otra
    const EJEMPLOS = ['Pliego', 'Vértice', 'Pulso', 'Cometa', 'Nimbo']
    if (marcaNombre && !EJEMPLOS.includes(marcaNombre)) {
      const visibleTxt = p.innerText || ''
      const restos = ['Pliego', 'Vértice', 'Pulso', 'PULSO', 'Cometa', 'Chispa', 'Estudio Marea', 'Semana gamer', 'Opera sin comisiones', 'Juega en serio', 'Recordatorios automáticos', 'pulso.gg', 'vertice.app', 'pliego.app', 'cometa.gg']
        .filter(x => new RegExp(`(^|[^\\p{L}])${x.replace('.', '\\.')}([^\\p{L}]|$)`, 'u').test(visibleTxt))
      if (restos.length) avisos.push(`Texto de la plantilla de ejemplo en la pieza de ${marcaNombre}: «${restos.join('», «')}» (fallo grave si no es a propósito)`)
      // Los recortes de las plantillas, por nombre y tamaño exacto (un recorte propio puede llamarse igual)
      const EJ = { 'jugador-perfil.webp': '1082x1978', 'jugador-tres-cuartos.webp': '1536x1918', 'jugadora-raton.webp': '1480x1600', 'mascota-chispa.webp': '1233x1464', 'producto-torre.webp': '1180x1680', 'cascos.webp': '735x900', 'jugadora.webp': '1300x1117', 'raton.webp': '658x1000', 'teclado.webp': '1400x617' }
      const deEjemplo = recortes.filter(x => EJ[(x.getAttribute('src') || '').split('/').pop()] === `${x.naturalWidth}x${x.naturalHeight}`).map(x => (x.getAttribute('src') || '').split('/').pop())
      if (deEjemplo.length) avisos.push(`Recortes de ejemplo de la plantilla (${deEjemplo.join(', ')}): no son el producto ni las personas de ${marcaNombre}. Cámbialos (sujetos.md) o entrégalos marcados como PROVISIONALES`)
    }
    if (look && escala < 2) avisos.push('Exporta la entrega a 2x (--escala 2): los looks se miran y se publican a doble densidad')
    return { nombre, ancho: w, alto: h, errores: [...new Set(errores)], avisos: [...new Set(avisos)], fuentesFallidas }
  })
}

// ── Hoja de contacto ────────────────────────────────────────────────────────

async function hojaDeContacto(navegador, pngs, destino, { perfil }) {
  const datos = await Promise.all(pngs.map(async f => `data:image/png;base64,${(await readFile(f)).toString('base64')}`))
  const nombres = pngs.map(f => path.basename(f, '.png'))
  const alto = 420
  const tiras = datos.map((d, i) => `<figure><img src="${d}" style="height:${alto}px"><figcaption>${nombres[i]}</figcaption></figure>`).join('')
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:32px;background:#e9e6e0;font:500 14px system-ui,sans-serif;color:#5b554c}
    .fila{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
    figure{margin:0} img{display:block;border-radius:6px;background:#fff}
    figcaption{margin-top:8px}
    h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 16px;color:#8a8379}
    .perfil{display:grid;grid-template-columns:repeat(3,200px);gap:3px;margin-top:40px}
    .perfil div{aspect-ratio:3/4;overflow:hidden;background:#fff}
    .perfil img{width:100%;height:100%;object-fit:cover;border-radius:0}
  </style>
  <h2>Secuencia a tamaño de móvil (${alto}px de alto)</h2><div class="fila">${tiras}</div>
  ${perfil ? `<h2 style="margin-top:40px">Rejilla del perfil (recorte 3:4)</h2><div class="perfil">${datos.slice(0, 3).map(d => `<div><img src="${d}"></div>`).join('')}</div>` : ''}`
  const pagina = await navegador.newPage({ viewport: { width: 1400, height: 900 } })
  await pagina.setContent(html, { waitUntil: 'load' })
  await pagina.screenshot({ path: destino, fullPage: true })
  await pagina.close()
}

// ── Principal ───────────────────────────────────────────────────────────────

const navegador = await abrirNavegador()
const contexto = await navegador.newContext({ viewport: { width: 2200, height: 2200 }, deviceScaleFactor: escala })
const pagina = await contexto.newPage()
const fallosRed = []
pagina.on('requestfailed', r => fallosRed.push(`${r.url().slice(0, 90)} (${r.failure()?.errorText})`))
pagina.on('pageerror', e => fallosRed.push(`Error JS: ${e.message}`))

await pagina.goto(pathToFileURL(fichero).href, { waitUntil: 'networkidle', timeout: 60000 })
await pagina.evaluate(() => document.fonts.ready)
let fuentesMarcaFallidas = []
if (marca) {
  fuentesMarcaFallidas = await pagina.evaluate(aplicarMarcaEnPagina, marca)
  console.log(`Marca: ${marca.nombre ?? '?'} (${path.relative(process.cwd(), ficheroMarca) || ficheroMarca})`)
}
// Con la fuente definitiva, las capas con data-sobre (producto.js) se vuelven a colocar encima de su fila
await pagina.evaluate(() => window.recolocar?.())
await pagina.waitForTimeout(250)

const informe = await pagina.evaluate(revisarEnPagina, { selector, solo, escala, marcaNombre: marca?.nombre ?? null })
if (!informe.length) { console.error(`No hay piezas que casen con ${selector}${solo ? ` y nombre ${solo}` : ''}`); await navegador.close(); process.exit(2) }

await mkdir(salida, { recursive: true })
const pngs = []
const elementos = await pagina.$$(selector)
for (const el of elementos) {
  const nombre = await el.evaluate((p, i) => p.dataset.pieza || p.id || null, 0)
  const item = informe.find(x => x.nombre === nombre) ?? informe[pngs.length]
  if (!item || (solo && nombre !== solo)) continue
  const destino = path.join(salida, `${item.nombre}.png`)
  await el.screenshot({ path: destino, animations: 'disabled' })
  pngs.push(destino)
}
if (pngs.length > 1 || flag('carrusel')) await hojaDeContacto(navegador, pngs, path.join(salida, 'hoja.png'), { perfil: flag('carrusel') })
await navegador.close()

const fuentes = informe[0]?.fuentesFallidas ?? []
await writeFile(path.join(salida, 'informe.json'), JSON.stringify({ fichero, escala, fallosRed, fuentesFallidas: fuentes, piezas: informe }, null, 2))

let nErr = 0, nAv = 0
console.log(`\n${pngs.length} pieza(s) → ${salida}`)
for (const p of informe) {
  nErr += p.errores.length; nAv += p.avisos.length
  const estado = p.errores.length ? 'ERROR' : p.avisos.length ? 'aviso' : 'ok'
  console.log(`\n[${estado}] ${p.nombre}  ${p.ancho}x${p.alto}`)
  for (const e of p.errores) console.log(`   ✗ ${e}`)
  for (const a of p.avisos.slice(0, 12)) console.log(`   · ${a}`)
  if (p.avisos.length > 12) console.log(`   · …y ${p.avisos.length - 12} avisos más (informe.json)`)
}
if (fuentes.length) { nErr++; console.log(`\n✗ Fuentes que no cargaron: ${fuentes.join(', ')}`) }
if (fuentesMarcaFallidas.length) { nErr++; console.log(`\n✗ La fuente de la marca («${fuentesMarcaFallidas.join('», «')}») no cargó: revisa tipografia.google_fonts en ${ficheroMarca}`) }
if (fallosRed.length) { nErr++; console.log(`\n✗ Recursos que fallaron:\n   ${fallosRed.join('\n   ')}`) }
console.log(`\nResumen: ${nErr} error(es), ${nAv} aviso(s).`)
console.log('Ahora ABRE los PNG y la hoja.png y míralos: el informe no sustituye a tu ojo.\n')
process.exit(nErr || (flag('estricto') && nAv) ? 1 : 0)
