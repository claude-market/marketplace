#!/usr/bin/env node
/**
 * recortar.mjs — quita el fondo de una foto o render (persona, producto, mascota) y deja un PNG con
 * transparencia listo para usar como <img data-recorte> en los looks editorial-recorte, tech-grid y
 * producto-3d-mascota. Funciona en local, sin servicios externos (modelo de segmentación ONNX).
 *
 * Uso:
 *   node recortar.mjs <entrada.png|jpg> <salida.png> [--modelo small|medium|large] [--max 2000]
 *
 *   --modelo  medium por defecto; large recorta mejor el pelo y las prendas oscuras (más lento)
 *   --max     lado máximo de la salida en px (por defecto, el de la entrada)
 *
 * La primera vez, en esta carpeta: npm install (instala @imgly/background-removal-node, ≈ 330 MB con el
 * modelo; solo hace falta si vas a recortar).
 *
 * Para que salga limpio: genera o fotografía el sujeto sobre un fondo liso y claro (gris, sin sombras
 * duras), con margen alrededor. Después MIRA el PNG sobre un fondo oscuro: halos grises en el pelo, huecos
 * dentro del sujeto (auriculares, asas) o partes del cuerpo comidas (ropa negra) → repite con --modelo large.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
if (args.length < 2 || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(args.length < 2 ? 2 : 0)
}
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const [entrada, salida] = args
let quitar
try { ({ removeBackground: quitar } = await import('@imgly/background-removal-node')) } catch {
  console.error('Falta @imgly/background-removal-node. Una sola vez, en la carpeta de este script:  npm install'); process.exit(2)
}
const ext = path.extname(entrada).toLowerCase()
const tipo = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png'
const t0 = Date.now()
const blob = await quitar(new Blob([await readFile(entrada)], { type: tipo }), {
  model: opt('modelo', 'medium'),
  output: { format: 'image/png', quality: 1 },
})
let buf = Buffer.from(await blob.arrayBuffer())
const max = Number(opt('max', 0))
if (max) {
  // Reescalado con Chrome (playwright-core, si está) para no añadir más dependencias
  try {
    const { chromium } = await import('playwright-core')
    const nav = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch({ channel: 'msedge' }))
    const p = await nav.newPage()
    const datos = await p.evaluate(async ({ b64, max }) => {
      const im = new Image(); im.src = `data:image/png;base64,${b64}`; await im.decode()
      const k = Math.min(1, max / Math.max(im.width, im.height))
      const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k)
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, c.width, c.height)
      return c.toDataURL('image/png').split(',')[1]
    }, { b64: buf.toString('base64'), max })
    buf = Buffer.from(datos, 'base64'); await nav.close()
  } catch { console.log('· No he podido reescalar (falta playwright-core o Chrome): se guarda al tamaño original') }
}
await writeFile(salida, buf)
console.log(`Recorte → ${salida} (${Math.round(buf.length / 1024)} KB, ${((Date.now() - t0) / 1000).toFixed(1)} s). Míralo sobre fondo oscuro antes de usarlo.`)
