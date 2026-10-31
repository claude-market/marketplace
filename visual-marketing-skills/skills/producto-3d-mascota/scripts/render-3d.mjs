#!/usr/bin/env node
/**
 * render-3d.mjs — renderiza una escena de three.js (un HTML de escenas/) a PNG con fondo transparente, con un
 * Chrome sin cabeza (WebGL por software: no hace falta tarjeta gráfica). Es la forma de tener el producto y la
 * mascota del look «producto 3D + mascota» (o cualquier recorte 3D) sin IA: con el modelo real del producto
 * (GLB/GLTF de la marca, con GLTFLoader) o con geometría propia, y con la luz de recorte del color de la marca.
 *
 * Uso:
 *   node render-3d.mjs escenas/mascota.html salida.png [--ancho 1600] [--alto 1600] [--param clave=valor …]
 *
 * La escena lee ?w=&h= (y los --param) de la URL, pinta en un <canvas> con alpha y pone window.listo = true
 * cuando ha terminado. Se sirve por HTTP desde esta carpeta: el importmap apunta a /node_modules/three/…
 * La primera vez, en esta carpeta: npm install (three y playwright-core).
 * Ejemplos: escenas/mascota.html y escenas/producto.html (los de la marca ficticia del ejemplo). Cambia los
 * colores por los de tu marca (--param luz=8b6bff) y renderiza al doble de lo que se verá a 1x.
 */
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
if (args.length < 2 || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(args.length < 2 ? 2 : 0)
}
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const params = args.flatMap((a, i) => (a === '--param' && args[i + 1] ? [args[i + 1]] : []))
const [escena, salida] = args
const ancho = Number(opt('ancho', 1600)), alto = Number(opt('alto', 1600))
const raiz = path.dirname(fileURLToPath(import.meta.url))
let chromium
try { ({ chromium } = await import('playwright-core')) } catch { console.error('Falta playwright-core. Una sola vez, en la carpeta de este script:  npm install'); process.exit(2) }
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.hdr': 'application/octet-stream', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json' }
const srv = http.createServer(async (req, res) => {
  try {
    const f = path.join(raiz, decodeURIComponent(req.url.split('?')[0]))
    if (!f.startsWith(raiz)) throw new Error('fuera')
    const d = await readFile(f)
    res.writeHead(200, { 'content-type': tipos[path.extname(f)] ?? 'application/octet-stream' }); res.end(d)
  } catch { res.writeHead(404); res.end() }
}).listen(0, '127.0.0.1')
const nav = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] })
  .catch(() => chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] }))
const p = await nav.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 })
p.on('pageerror', e => console.log('[error en la escena]', e.message))
const rel = path.relative(raiz, path.resolve(escena)).split(path.sep).join('/')
const q = new URLSearchParams({ w: ancho, h: alto, ...Object.fromEntries(params.map(x => x.split('='))) })
await p.goto(`http://127.0.0.1:${srv.address().port}/${rel}?${q}`)
await p.waitForFunction(() => window.listo === true, null, { timeout: 180000 })
await p.locator('canvas').first().screenshot({ path: salida, omitBackground: true })
console.log(`Render → ${salida} (${ancho}x${alto}). Míralo sobre un fondo oscuro y del color del look antes de usarlo.`)
await nav.close(); srv.close()
