#!/usr/bin/env node
/**
 * generar.mjs — genera una imagen con la API de Higgsfield (pago por uso) con el gasto controlado: calcula el coste
 * exacto antes (gratis), no pasa del tope, no lanza más de 2 trabajos a la vez y apunta cada gasto.
 *
 * Uso:
 *   node generar.mjs "<prompt en inglés>" salida.png [opciones]
 *
 *   --modelo <m>       soul (por defecto: fotos realistas, personas, producto; ≈0,006 $ a 1080p)
 *                      z-image (objetos, 3D, ilustración; ≈0,015 $) · qwen (≈0,04 $)
 *   --formato <r>      1:1 (por defecto), 4:3, 3:4, 16:9, 9:16, 2:3, 3:2
 *   --resolucion <r>   soul: 720p | 1080p (por defecto) · z-image y qwen: 1k | 2k (por defecto)
 *   --cantidad <n>     1 (por defecto) o 4 (solo soul: cuatro variantes en una petición)
 *   --semilla <n>      misma semilla = mismo estilo entre variantes
 *   --si               lánzalo de verdad. Sin --si solo dice cuánto costaría (no gasta nada)
 *
 * Variables de entorno:
 *   HIGGSFIELD_API_KEY   «id:secreto» de https://open.higgsfield.ai → API keys (la del usuario; nunca la escribas
 *                        en ficheros ni la enseñes)
 *   IMAGEN_IA_TOPE_USD   gasto máximo acumulado que el usuario ha autorizado (por defecto 0,50 $). Si una imagen
 *                        lo pasaría, no se lanza: pide permiso al usuario para subirlo
 *   IMAGEN_IA_REGISTRO   fichero del registro de gasto (por defecto ~/.imagen-ia/gasto.jsonl)
 *   IMAGEN_IA_SIMULTANEAS  trabajos a la vez como mucho (por defecto 2, el límite de las cuentas nuevas)
 *
 * Salida: el PNG/JPG en la ruta pedida (con la extensión real que devuelve Higgsfield) y, con --cantidad 4,
 * salida-1 … salida-4. Códigos de salida: 0 bien · 2 uso · 3 falta la clave · 4 pasaría del tope · 5 error de la API
 * o contenido bloqueado (no se cobra).
 */
import { readFile, writeFile, mkdir, appendFile, unlink, stat } from 'node:fs/promises'
import { openSync, closeSync, existsSync, readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'

const args = process.argv.slice(2)
if (args.length < 2 || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(args.length < 2 ? 2 : 0)
}
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const [prompt, salidaPedida] = args
const MODELOS = {
  soul: { endpoint: 'higgsfield-ai/soul/v2/standard', resoluciones: ['720p', '1080p'], res: '1080p', formatos: ['1:1', '9:16', '16:9', '4:3', '3:4', '2:3', '3:2'], lote: true },
  'z-image': { endpoint: 'z-image/turbo', resoluciones: ['1k', '2k'], res: '2k', formatos: ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'] },
  qwen: { endpoint: 'alibaba/qwen-image-3/text-to-image', resoluciones: ['1k', '2k'], res: '2k', formatos: ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'] },
}
const nombreModelo = opt('modelo', 'soul')
const m = MODELOS[nombreModelo]
if (!m) { console.error(`Modelo desconocido «${nombreModelo}». Usa: ${Object.keys(MODELOS).join(', ')}`); process.exit(2) }
const formato = opt('formato', '1:1'), resolucion = opt('resolucion', m.res), cantidad = Number(opt('cantidad', 1))
if (!m.formatos.includes(formato)) { console.error(`Formato ${formato} no vale con ${nombreModelo}: ${m.formatos.join(', ')}`); process.exit(2) }
if (!m.resoluciones.includes(resolucion)) { console.error(`Resolución ${resolucion} no vale con ${nombreModelo}: ${m.resoluciones.join(', ')}`); process.exit(2) }
if (cantidad !== 1 && !(m.lote && cantidad === 4)) { console.error('Cantidad: 1, o 4 con soul'); process.exit(2) }

const clave = process.env.HIGGSFIELD_API_KEY || ''
if (!/^[^:\s]+:[^:\s]+$/.test(clave)) {
  console.error('No hay HIGGSFIELD_API_KEY («id:secreto», de https://open.higgsfield.ai → API keys).\n' +
    'Sin IA: usa las fotos del usuario (recortar.mjs) o un render 3D de la librería (producto-3d-mascota/scripts/escenas).')
  process.exit(3)
}
const tope = Number(String(process.env.IMAGEN_IA_TOPE_USD ?? '0.5').replace(',', '.'))
const registro = process.env.IMAGEN_IA_REGISTRO || path.join(os.homedir(), '.imagen-ia', 'gasto.jsonl')
const simultaneas = Math.max(1, Number(process.env.IMAGEN_IA_SIMULTANEAS || 2))
const usd = n => `${n.toFixed(3).replace('.', ',')} $`
const limpio = t => String(t).split(clave).join('[clave]').split(clave.split(':')[1] || '¬').join('[clave]').slice(0, 400)

async function pedir(metodo, ruta, cuerpo, extra = {}) {
  let r
  try {
    r = await fetch(`https://api.higgsfield.ai/${ruta}`, { method: metodo, headers: { Authorization: `Key ${clave}`, 'Content-Type': 'application/json', Accept: 'application/json', ...extra }, body: cuerpo ? JSON.stringify(cuerpo) : undefined })
  } catch (e) { console.error(`Sin conexión con api.higgsfield.ai: ${e.message}`); process.exit(5) }
  const t = await r.text()
  if (!r.ok) {
    const motivo = limpio(t)
    const que = r.status === 401 ? 'la clave no vale' : r.status === 402 || r.status === 403 ? 'no queda saldo en la cuenta de Higgsfield' : r.status === 422 ? 'parámetros no aceptados' : r.status === 429 ? 'demasiados trabajos a la vez' : `error ${r.status}`
    console.error(`Higgsfield: ${que}. ${motivo}`); process.exit(5)
  }
  try { return JSON.parse(t) } catch { return {} }
}

// Registro: una línea por trabajo; la última línea de cada id manda (los fallidos se corrigen a 0 $)
function gastado() {
  if (!existsSync(registro)) return 0
  const ult = new Map()
  for (const l of readFileSync(registro, 'utf8').split('\n')) { try { const x = JSON.parse(l); ult.set(x.id, x) } catch { /* línea rota */ } }
  return [...ult.values()].reduce((a, x) => a + (Number(x.usd) || 0), 0)
}
const apuntar = async x => { await mkdir(path.dirname(registro), { recursive: true }); await appendFile(registro, JSON.stringify(x) + '\n') }

const cuerpo = { prompt, aspect_ratio: formato, resolution: resolucion }
if (nombreModelo === 'soul') { cuerpo.batch_size = cantidad; cuerpo.enhance_prompt = false }
if (opt('semilla', null)) cuerpo.seed = Number(opt('semilla'))

const est = await pedir('POST', `estimate/${m.endpoint}`, cuerpo)
const coste = Number(est.usd)
if (!Number.isFinite(coste)) { console.error('Higgsfield no ha dado el coste: no lo lanzo a ciegas.'); process.exit(5) }
const ya = gastado()
console.log(`Coste: ${usd(coste)} (${nombreModelo}, ${formato}, ${resolucion}${cantidad > 1 ? `, ${cantidad} imágenes` : ''}). Gastado: ${usd(ya)} de un tope de ${usd(tope)}.`)
if (ya + coste > tope + 1e-9) {
  console.error(`No lo lanzo: pasaría del tope (${usd(ya + coste)} > ${usd(tope)}). Pide permiso al usuario para subir IMAGEN_IA_TOPE_USD.`)
  process.exit(4)
}
if (!args.includes('--si')) { console.log('Solo estimado (no se ha gastado nada). Para lanzarlo, añade --si.'); process.exit(0) }

// Cola: como mucho N trabajos a la vez en esta máquina (cerrojos en el temporal; caducan a los 10 min)
const cola = path.join(os.tmpdir(), 'imagen-ia-cola')
await mkdir(cola, { recursive: true })
let cerrojo = null
for (let intento = 0; !cerrojo; intento++) {
  for (let i = 0; i < simultaneas && !cerrojo; i++) {
    const f = path.join(cola, `hueco-${i}.lock`)
    try { closeSync(openSync(f, 'wx')); cerrojo = f } catch {
      try { if (Date.now() - (await stat(f)).mtimeMs > 600000) await unlink(f) } catch { /* otro lo ha soltado */ }
    }
  }
  if (!cerrojo) {
    if (intento === 0) console.log(`Hay ${simultaneas} trabajos en marcha: espero turno…`)
    if (intento > 200) { console.error('Llevo 10 minutos esperando turno: reintenta luego.'); process.exit(5) }
    await new Promise(r => setTimeout(r, 3000))
  }
}
const soltar = async () => { try { await unlink(cerrojo) } catch { /* ya no está */ } }
process.on('SIGINT', async () => { await soltar(); process.exit(130) })

try {
  const d = await pedir('POST', m.endpoint, cuerpo, { 'Idempotency-Key': randomUUID() })
  if (!d.request_id) { console.error('Higgsfield no ha devuelto el id del trabajo.'); process.exit(5) }
  await apuntar({ fecha: new Date().toISOString(), id: d.request_id, modelo: nombreModelo, usd: coste, prompt: prompt.slice(0, 160) })
  const t0 = Date.now(); let e = {}, pausa = 2000
  for (;;) {
    e = await pedir('GET', `requests/${d.request_id}/status`)
    if (!['queued', 'in_progress'].includes(e.status)) break
    if (Date.now() - t0 > 300000) { console.error(`Sigue en marcha a los 5 min (id ${d.request_id}).`); process.exit(5) }
    await new Promise(r => setTimeout(r, pausa)); pausa = Math.min(pausa * 1.5, 8000)
  }
  if (e.status !== 'completed') {
    await apuntar({ fecha: new Date().toISOString(), id: d.request_id, modelo: nombreModelo, usd: 0, estado: e.status })
    console.error(e.status === 'nsfw' ? 'Bloqueada por contenido (no se cobra): cambia el prompt (nada de marcas, famosos ni personajes con derechos).' : `Ha fallado (no se cobra): ${limpio(e.error ?? e.status)}`)
    process.exit(5)
  }
  const urls = (e.images || []).map(x => x.url).filter(Boolean)
  const ficheros = []
  for (const [i, url] of urls.entries()) {
    const r = await fetch(url)
    if (!r.ok) { console.error(`No he podido bajar ${url} (${r.status}); dura 7 días en Higgsfield.`); process.exit(5) }
    const tipo = (r.headers.get('content-type') || '').split(';')[0]
    const ext = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' }[tipo] || path.extname(new URL(url).pathname) || '.png'
    const base = salidaPedida.replace(/\.(png|jpe?g|webp)$/i, '')
    const f = `${base}${urls.length > 1 ? `-${i + 1}` : ''}${ext}`
    await mkdir(path.dirname(path.resolve(f)), { recursive: true })
    await writeFile(f, Buffer.from(await r.arrayBuffer()))
    ficheros.push(f)
  }
  console.log(`Hecho en ${Math.round((Date.now() - t0) / 1000)} s → ${ficheros.join(', ')}. Gastado en total: ${usd(gastado())}.`)
  console.log('Ábrela (Read) y revísala antes de usarla: manos, caras, letras o logos inventados, bordes, luz.')
} finally { await soltar() }
