#!/usr/bin/env node
/**
 * comparar.mjs — el paso «mirar al lado de la referencia» del bucle de pulido. Pone tu pieza junto a la pieza
 * «golden» del look (la muestra de referencia que va dentro de la skill, en <look>/referencia/golden.jpg), a la misma
 * altura, y debajo un detalle de cada una a tamaño real (el 100 % de los píxeles: ahí se ve si el producto es de
 * juguete, si un recorte tiene halo o si la interfaz está vacía). Imprime la lista de comprobación del look para que
 * puntúes cada punto de 1 a 10.
 *
 * Uso:
 *   node comparar.mjs out/<pieza>/hero.png --look <look> [--vuelta 1] [--zoom 62,55] [--salida revision/vuelta-1.png]
 *
 *   --look    producto-en-contexto | oscuro-glow | editorial-recorte | producto-3d-mascota | tech-grid
 *   --zoom    centro del detalle en % de tu pieza (por defecto, el del sujeto de la golden: es donde suele estar)
 *   --vuelta  número de vuelta del bucle (nombra la salida: revision/vuelta-N.png)
 *
 * Después: abre la imagen con Read, puntúa cada punto de la lista (1-10) en revision/vuelta-N.md con lo que vas a
 * cambiar, corrige, exporta y repite. Se entrega con 2 vueltas como mínimo y todo ≥ 8 (ver revision-visual.md).
 */
import { readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
if (!args.length || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(args.length ? 0 : 2)
}
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const pieza = path.resolve(args[0])
const look = opt('look', null)
const LOOKS = ['producto-en-contexto', 'oscuro-glow', 'editorial-recorte', 'producto-3d-mascota', 'tech-grid']
if (!LOOKS.includes(look)) { console.error(`--look: uno de ${LOOKS.join(', ')}`); process.exit(2) }
if (!existsSync(pieza)) { console.error(`No existe ${pieza}`); process.exit(2) }
const vuelta = opt('vuelta', '1')
const salida = path.resolve(opt('salida', path.join(process.cwd(), 'revision', `vuelta-${vuelta}.png`)))
const dirRef = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', look, 'referencia')
const golden = path.join(dirRef, 'golden.jpg')
if (!existsSync(golden)) { console.error(`No encuentro la golden del look en ${golden}`); process.exit(2) }
const meta = existsSync(path.join(dirRef, 'golden.json')) ? JSON.parse(await readFile(path.join(dirRef, 'golden.json'), 'utf8')) : {}
const [zx, zy] = (opt('zoom', null) ?? (meta.detalle ?? [60, 55]).join(',')).split(',').map(Number)
const [gx, gy] = meta.detalle ?? [60, 55]
let chromium
try { ({ chromium } = await import('playwright-core')) } catch { console.error('Falta playwright-core: npm install en esta carpeta'); process.exit(2) }
const datos = async f => `data:image/${f.endsWith('.jpg') ? 'jpeg' : f.split('.').pop()};base64,${(await readFile(f)).toString('base64')}`
const [up, ug] = await Promise.all([datos(pieza), datos(golden)])
const nav = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch({ channel: 'msedge' })).catch(() => chromium.launch())
const p = await nav.newPage({ viewport: { width: 1700, height: 1000 } })
await p.setContent(`<style>
  body{margin:0;padding:18px;background:#16171b;font:600 15px system-ui;color:#e8e8ea;display:inline-block}
  .f{display:flex;gap:18px;margin-bottom:16px}
  figure{margin:0} figcaption{margin-top:6px;color:#aab}
  .grande{height:460px;display:block;border-radius:6px}
  .det{width:780px;height:420px;overflow:hidden;position:relative;border-radius:6px;background:#000}
  .det img{position:absolute}
</style><body>
<div class="f"><figure><img class="grande" src="${up}"><figcaption>Tu pieza (vuelta ${vuelta})</figcaption></figure>
<figure><img class="grande" src="${ug}"><figcaption>Golden del look ${look}</figcaption></figure></div>
<div class="f"><figure><div class="det"><img id="dp" src="${up}"></div><figcaption>Detalle de tu pieza al 100 % (centro ${zx} %, ${zy} %)</figcaption></figure>
<figure><div class="det"><img id="dg" src="${ug}"></div><figcaption>Detalle de la golden al 100 %</figcaption></figure></div></body>`)
const dims = await p.evaluate(async ({ zx, zy, gx, gy }) => {
  const [ip, ig] = ['dp', 'dg'].map(id => document.getElementById(id))
  await Promise.all([ip.decode(), ig.decode()])
  const pon = (im, cx, cy, escala) => {
    const w = im.naturalWidth * escala, h = im.naturalHeight * escala
    im.style.width = `${w}px`; im.style.left = `${390 - w * cx / 100}px`; im.style.top = `${210 - h * cy / 100}px`
  }
  pon(ip, zx, zy, 1)
  // La golden se escala para que un píxel de pieza ocupe lo mismo en las dos (la tuya suele ir a 2x)
  pon(ig, gx, gy, Math.min(2, Math.max(0.5, ip.naturalWidth / ig.naturalWidth)))
  return { a: [ip.naturalWidth, ip.naturalHeight], g: [ig.naturalWidth, ig.naturalHeight] }
}, { zx, zy, gx, gy })
await mkdir(path.dirname(salida), { recursive: true })
await p.locator('body').screenshot({ path: salida })
await nav.close()
console.log(`Comparación → ${salida}  (tu pieza ${dims.a.join('x')}, golden ${dims.g.join('x')})`)
const informe = path.join(path.dirname(pieza), 'informe.json')
if (existsSync(informe)) {
  const inf = JSON.parse(await readFile(informe, 'utf8'))
  const pz = inf.piezas.find(x => pieza.endsWith(`${x.nombre}.png`))
  if (pz) console.log(`Exportador: ${pz.errores.length} error(es), ${pz.avisos.length} aviso(s) en ${pz.nombre}. Errores = se arreglan siempre.`)
}
const md = existsSync(path.join(dirRef, 'golden.md')) ? await readFile(path.join(dirRef, 'golden.md'), 'utf8') : ''
const lista = md.split(/\n## /).find(s => s.startsWith('Lista de comprobación'))
if (lista) {
  console.log(`\nPuntúa de 1 a 10 cada punto en revision/vuelta-${vuelta}.md (y qué cambias). Se entrega con todo ≥ 8:\n`)
  console.log(lista.split('\n').slice(1).join('\n').trim())
}
console.log('\nAbre la imagen de la comparación con Read antes de puntuar. Mínimo 2 vueltas.')
