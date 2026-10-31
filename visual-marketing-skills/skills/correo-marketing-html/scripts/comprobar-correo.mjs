#!/usr/bin/env node
/**
 * comprobar-correo.mjs — revisa un correo HTML como lo haría un cliente de
 * correo exigente y lo renderiza en las condiciones en que lo verá la gente.
 *
 * Uso:
 *   node comprobar-correo.mjs <correo.html> [--marketing] [--borrador] [--salida <dir>] [--sin-render]
 *
 *   --marketing   Exige enlace de baja (LSSI / RGPD y buena entregabilidad)
 *   --borrador    Deja pasar imágenes con ruta local (hero-ejemplo.png) como aviso, para previsualizar
 *                 antes de subirlas. Para dar el correo por bueno, sin esta opción.
 *   --salida      Carpeta de salida (por defecto revision-<nombre>/ junto al HTML)
 *   --sin-render  Solo las comprobaciones estáticas
 *
 * Genera:
 *   escritorio.png     600 px de correo dentro de una ventana de 900 px
 *   movil.png          375 px de ancho (iPhone), densidad 2
 *   sin-imagenes.png   con las imágenes bloqueadas (Outlook y Gmail a veces lo hacen): ¿se entiende?
 *   oscuro.png         simulación de modo oscuro con inversión total (Gmail app / Outlook.com)
 *   informe.json       todo lo encontrado
 *
 * Errores = no se envía así. Avisos = se envía si hay un motivo.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
if (!args.length || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(0)
}
const opt = (n, def) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : def }
const flag = n => args.includes(`--${n}`)
const fichero = path.resolve(args[0])
if (!existsSync(fichero)) { console.error(`No existe: ${fichero}`); process.exit(2) }
const salida = path.resolve(opt('salida', path.join(path.dirname(fichero), `revision-${path.basename(fichero, path.extname(fichero))}`)))
const marketing = flag('marketing')
const borrador = flag('borrador')

const html = await readFile(fichero, 'utf8')
const errores = [], avisos = [], datos = {}
// Los comentarios normales no cuentan (sí los condicionales de Outlook)
const sinComentarios = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
const err = m => errores.push(m), av = m => avisos.push(m)

// ── Comprobaciones estáticas ────────────────────────────────────────────────

const kb = Buffer.byteLength(html, 'utf8') / 1024
datos.pesoKB = Math.round(kb * 10) / 10
if (kb > 102) err(`Pesa ${datos.pesoKB} KB: Gmail lo corta a partir de 102 KB («Mensaje recortado») y se pierde el pie con la baja`)
else if (kb > 80) av(`Pesa ${datos.pesoKB} KB: cerca del corte de Gmail (102 KB)`)

for (const [re, que] of [[/<script\b/i, '<script>'], [/<form\b/i, '<form>'], [/<iframe\b/i, '<iframe>'], [/<video\b/i, '<video>'], [/<svg\b/i, '<svg> en línea'], [/<link\b[^>]*stylesheet/i, 'hoja de estilos externa'], [/@import/i, '@import'], [/<object\b|<embed\b/i, '<object>/<embed>']]) {
  if (re.test(html)) err(`Contiene ${que}: los clientes de correo lo eliminan o lo bloquean`)
}
if (!/<!doctype html>/i.test(html)) av('Falta <!DOCTYPE html>')
if (!/<html[^>]*\blang=/i.test(html)) av('Falta lang en <html> (lectores de pantalla y traducción)')
if (!/<meta[^>]+charset/i.test(html)) err('Falta <meta charset="utf-8">: las tildes pueden salir rotas')
if (!/<meta[^>]+viewport/i.test(html)) av('Falta <meta name="viewport">')
if (!/color-scheme/i.test(html)) av('Falta <meta name="color-scheme" content="light">: sin él, más clientes invierten los colores')
if (!/<title>[^<]+<\/title>/i.test(html)) av('Falta <title> (lo enseñan algunos clientes y la vista web)')
if (!/display:\s*none[^>]*>[^<]{20,}/i.test(html)) av('No veo preencabezado oculto: la bandeja enseñará «Hola…» o el texto alternativo del logo en vez del adelanto')

// Estilo sobrio: sin brillos, sombras, degradados ni bordes de color
const estilos = [...html.matchAll(/style\s*=\s*"([^"]*)"/gi)].map(m => m[1]).concat([...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]))
const todo = estilos.join(';')
if (/box-shadow\s*:(?!\s*none)/i.test(todo)) err('Lleva box-shadow: el estilo es plano (y Outlook no lo pinta igual)')
if (/text-shadow\s*:(?!\s*none)/i.test(todo)) err('Lleva text-shadow: nada de brillos en el texto')
if (/(linear|radial|conic)-gradient/i.test(todo)) err('Lleva degradados: fondos planos (Outlook los ignora y queda el color de debajo, o nada)')
if (/filter\s*:|backdrop-filter/i.test(todo)) err('Lleva filter/backdrop-filter: no funciona en correo')
if (/background(-image)?\s*:[^;]*url\(/i.test(todo) || /\bbackground\s*=\s*"/i.test(html)) av('Imagen de fondo: Outlook de escritorio no la pinta. Que nada importante dependa de ella')
if (/position\s*:\s*(absolute|fixed|relative)/i.test(todo)) err('Usa position: los clientes de correo lo eliminan')
if (/display\s*:\s*(flex|grid)/i.test(todo)) err('Usa flex/grid: Outlook y Gmail no los respetan. Maqueta con tablas')

const neutro = (hex) => {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const s = max === 0 ? 0 : (max - min) / max
  return s < 0.18 || max - min < 0.09
}
const bordes = [...todo.matchAll(/border(?:-(?:top|right|bottom|left))?\s*:\s*([^;]+)/gi)].map(m => m[1])
const bordesColor = bordes.flatMap(b => (b.match(/#[0-9a-f]{3,6}\b/gi) ?? [])).filter(c => !neutro(c))
if (bordesColor.length) err(`Bordes de color (${[...new Set(bordesColor)].join(', ')}): los bordes son líneas finas neutras o nada`)
if (/border[^;]*dashed|border[^;]*dotted/i.test(todo)) av('Bordes discontinuos: se leen como cupón barato. Mejor un fondo plano')

// Fondo blanco (el que mejor aguanta el modo oscuro y los clientes que pintan el suyo)
const fondoBody = /<body[^>]*style="[^"]*background(?:-color)?\s*:\s*(#[0-9a-f]{3,6}|white)/i.exec(html)?.[1]?.toLowerCase()
datos.fondo = fondoBody ?? 'sin definir'
if (!fondoBody) av('El <body> no declara color de fondo: algunos clientes ponen el suyo')
else if (!['#fff', '#ffffff', 'white'].includes(fondoBody)) av(`Fondo del body ${fondoBody}: estas plantillas usan fondo blanco`)

// <style>: solo mejoras (media queries), nunca lo esencial
for (const bloque of [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1])) {
  const fuera = bloque.replace(/@media[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim()
  if (fuera) av('El <style> tiene reglas fuera de @media: si el cliente lo quita (Gmail con cuentas no Google, Outlook antiguo), se pierden. Pásalas a línea')
}

// Imágenes
const imgs = [...sinComentarios.matchAll(/<img\b[^>]*>/gi)].map(m => m[0])
datos.imagenes = imgs.length
for (const img of imgs) {
  const src = /src\s*=\s*"([^"]*)"/i.exec(img)?.[1] ?? ''
  const corto = src.slice(0, 70)
  if (!/^https:\/\//i.test(src)) {
    const m = `Imagen sin URL https absoluta: ${corto || '(vacía)'}. Súbela a un sitio público antes de enviar`
    borrador && src && !/^http:/i.test(src) ? av(m) : err(m)
  }
  if (/\.(webp|svg|avif)(\?|$)/i.test(src)) err(`Formato que Outlook no pinta (usa PNG o JPG): ${corto}`)
  if (!/\balt\s*=/i.test(img)) err(`Imagen sin alt: ${corto}`)
  if (!/\bwidth\s*=\s*"?\d/i.test(img)) av(`Imagen sin atributo width (Outlook la pinta a tamaño real): ${corto}`)
  if (!/display\s*:\s*block/i.test(img)) av(`Imagen sin display:block (deja una raya de 3-4 px debajo en Gmail): ${corto}`)
}

// Enlaces
const enlaces = [...sinComentarios.matchAll(/<a\b[^>]*href\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ href: m[1], texto: m[2].replace(/<[^>]+>/g, '').trim() }))
datos.enlaces = enlaces.length
for (const e of enlaces) {
  if (!e.href || e.href === '#') err(`Enlace vacío o «#»: «${e.texto.slice(0, 40)}»`)
  else if (/^http:\/\//i.test(e.href)) av(`Enlace sin https: ${e.href.slice(0, 70)}`)
  else if (/^javascript:/i.test(e.href)) err('Enlace javascript:')
  if (/^(aquí|aqui|click|haz clic|pincha)$/i.test(e.texto)) av(`Texto de enlace sin significado: «${e.texto}»`)
}
const tieneBaja = enlaces.some(e => /baja|unsubscribe|darme de baja|cancelar suscrip/i.test(e.texto + ' ' + e.href)) || /\{\{\s*url_baja\s*\}\}|\{\{\s*unsubscribe/i.test(html)
if (marketing && !tieneBaja) err('Correo comercial sin enlace de baja visible (obligatorio por la LSSI y lo mira Gmail)')
if (marketing && !/list-unsubscribe/i.test(html)) av('Recuerda la cabecera List-Unsubscribe (y One-Click) al enviarlo: la exigen Gmail y Yahoo a remitentes masivos')

// Marca sin aplicar y restos de plantilla
const sinMarca = [...new Set(sinComentarios.match(/%%[\w.-]+%%/g) ?? [])]
if (sinMarca.length) err(`Marca sin aplicar (${sinMarca.slice(0, 4).join(' ')}…): pasa antes aplicar-marca.mjs <plantilla> <marca.json>`)
const restos = sinComentarios.match(/\[\[[^\]]+\]\]|\bTODO\b|[Ll]orem ipsum|XXX/g)
if (restos) err(`Restos de plantilla: ${[...new Set(restos)].slice(0, 5).join(', ')}`)
const etiquetas = [...new Set(html.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? [])]
if (etiquetas.length) av(`Etiquetas de combinación ${etiquetas.join(' ')}: comprueba que tu motor de envío las rellena`)

// Texto: fuente en cada celda, tamaños y cantidad
const celdasTexto = [...html.matchAll(/<(td|p|h[1-6]|a|span|li)\b([^>]*)>([^<]{3,})/gi)]
  .filter(m => m[3].replace(/&[a-z#0-9]+;/gi, '').trim() && !/display\s*:\s*none/i.test(m[2]))
const sinFuente = celdasTexto.filter(m => !/font-family/i.test(m[2]) && ['td', 'p', 'h1', 'h2', 'h3', 'li'].includes(m[1].toLowerCase()))
if (sinFuente.length) av(`${sinFuente.length} bloque(s) de texto sin font-family en línea (Outlook pone Times): p. ej. «${sinFuente[0][3].trim().slice(0, 40)}»`)
const visibles = estilos.filter(s => !/display\s*:\s*none|font-size\s*:\s*0/i.test(s)).join(';')
const pequenos = [...visibles.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/gi)].map(m => Number(m[1])).filter(n => n < 12)
if (pequenos.length) av(`Hay texto a ${Math.min(...pequenos)}px: por debajo de 12 px no se lee en el móvil (y iOS lo agranda solo)`)
const textoPlano = html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()
datos.palabras = textoPlano.split(' ').filter(w => /\w/.test(w)).length
if (datos.palabras < 50) av(`Solo ${datos.palabras} palabras de texto real: los filtros de spam desconfían de los correos que son casi todo imagen`)
if (/!{2,}|¡[^!]*!\s*¡/.test(textoPlano)) av('Exclamaciones en cadena: suenan a spam')
if (/[\u{1F300}-\u{1FAFF}]/u.test(textoPlano)) av('Hay emojis en el cuerpo: el estilo sobrio no los usa (si la marca sí, que sea a propósito)')

// Ancho del contenedor
const anchos = [...html.matchAll(/<table[^>]*\bwidth\s*=\s*"(\d+)"/gi)].map(m => Number(m[1]))
if (anchos.length && Math.max(...anchos) > 640) av(`Tabla de ${Math.max(...anchos)} px: el estándar es 600 (máx. 640)`)
if (!/<!--\[if mso\]>/i.test(html)) av('Sin comentarios condicionales para Outlook (VML del botón, tabla fantasma): en Outlook de escritorio el botón saldrá como un enlace')

// ── Render ──────────────────────────────────────────────────────────────────

async function abrirNavegador() {
  let pw
  for (const mod of ['playwright-core', 'playwright']) { try { pw = await import(mod); break } catch { } }
  if (!pw) { console.error('Falta playwright-core. Una sola vez, en la carpeta de este script:  npm install'); process.exit(2) }
  const intentos = []
  if (process.env.CHROME_PATH) intentos.push({ executablePath: process.env.CHROME_PATH })
  intentos.push({ channel: 'chrome' }, { channel: 'msedge' }, {})
  for (const o of intentos) { try { return await pw.chromium.launch({ headless: true, ...o }) } catch { } }
  console.error('No encuentro Chrome ni Edge. Instala Chrome, define CHROME_PATH o ejecuta: npx playwright install chromium'); process.exit(2)
}

const vistas = []
if (!flag('sin-render')) {
  await mkdir(salida, { recursive: true })
  const nav = await abrirNavegador()
  const url = pathToFileURL(fichero).href
  const toma = async (nombre, ctxOpts, prep) => {
    const ctx = await nav.newContext(ctxOpts)
    const p = await ctx.newPage()
    const rotas = []
    p.on('requestfailed', r => { if (!/\.(png|jpe?g|gif)/i.test(r.url()) || nombre !== 'sin-imagenes') rotas.push(r.url().slice(0, 90)) })
    if (prep) await prep(p)
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await p.waitForTimeout(200)
    const medida = await p.evaluate(() => ({
      ancho: document.documentElement.scrollWidth, vista: window.innerWidth,
      rotas: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.slice(0, 80)),
    }))
    if (nombre === 'movil' && medida.ancho > medida.vista + 1) err(`En móvil hay scroll horizontal (${medida.ancho}px en ${medida.vista}px): algo no se adapta`)
    if (nombre === 'escritorio') for (const r of medida.rotas) err(`Imagen que no carga: ${r}`)
    for (const r of rotas) if (nombre === 'escritorio') err(`Recurso que falla: ${r}`)
    const destino = path.join(salida, `${nombre}.png`)
    await p.screenshot({ path: destino, fullPage: true })
    vistas.push(destino)
    await ctx.close()
  }
  await toma('escritorio', { viewport: { width: 900, height: 900 } })
  await toma('movil', { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await toma('sin-imagenes', { viewport: { width: 900, height: 900 } }, p => p.route(/\.(png|jpe?g|gif|webp)(\?.*)?$/i, r => r.abort()))
  await toma('oscuro', { viewport: { width: 900, height: 900 }, colorScheme: 'dark' }, p => p.addInitScript(() => {
    // Inversión total como Gmail en iOS/Android: el texto y los fondos se invierten, las fotos no
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style')
      s.textContent = 'html{filter:invert(1) hue-rotate(180deg);background:#fff} img{filter:invert(1) hue-rotate(180deg)}'
      document.head.appendChild(s)
    })
  }))
  await nav.close()
}

await mkdir(salida, { recursive: true })
await writeFile(path.join(salida, 'informe.json'), JSON.stringify({ fichero, datos, errores, avisos, vistas }, null, 2))

console.log(`\nCorreo: ${path.basename(fichero)} · ${datos.pesoKB} KB · ${datos.palabras} palabras · ${datos.imagenes} imágenes · ${datos.enlaces} enlaces`)
for (const e of errores) console.log(`  ✗ ${e}`)
for (const a of avisos) console.log(`  · ${a}`)
console.log(`\nResumen: ${errores.length} error(es), ${avisos.length} aviso(s).`)
if (vistas.length) console.log(`Vistas en ${salida}:\n  ${vistas.map(v => path.basename(v)).join('  ')}\nÁBRELAS Y MÍRALAS (escritorio, móvil, sin imágenes y oscuro) antes de enviar nada.\n`)
process.exit(errores.length ? 1 : 0)
