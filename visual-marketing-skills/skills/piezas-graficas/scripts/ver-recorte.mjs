#!/usr/bin/env node
/**
 * ver-recorte.mjs — hoja de revisión de recortes: cada recorte sobre negro, sobre el color del look y sobre
 * damero, y el borde más delicado (pelo, orejas, antenas, cables) ampliado al 300 %. Es donde se ven el halo claro,
 * los restos de fondo, las motas y los bordes mordidos que a tamaño real pasan desapercibidos.
 *
 * Uso:
 *   node ver-recorte.mjs salida.png recorte1.webp [recorte2.png …] [--fondo #1a1f6b]
 *
 * Abre después salida.png con Read. Un recorte vale si: el borde no tiene línea clara ni gris, no quedan trozos
 * del fondo (entre brazo y cuerpo, entre los dedos, en el pelo), no hay letras ni logos inventados y la luz es la
 * misma en todos los recortes de la pieza.
 */
import { readFile } from 'node:fs/promises'

const args = process.argv.slice(2)
if (args.length < 2 || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(args.length < 2 ? 2 : 0)
}
const i = args.indexOf('--fondo'); const fondo = i >= 0 ? args[i + 1] : '#2a2f8f'
const ficheros = args.slice(1).filter((a, k, arr) => a !== '--fondo' && arr[k - 1] !== '--fondo')
const salida = args[0]
let chromium
try { ({ chromium } = await import('playwright-core')) } catch { console.error('Falta playwright-core: npm install en esta carpeta'); process.exit(2) }
const nav = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch({ channel: 'msedge' })).catch(() => chromium.launch())
const p = await nav.newPage({ viewport: { width: 1600, height: 900 } })
const urls = await Promise.all(ficheros.map(async f => {
  const e = f.toLowerCase().split('.').pop()
  return { f: f.split(/[\\/]/).pop(), u: `data:image/${e === 'jpg' ? 'jpeg' : e};base64,${(await readFile(f)).toString('base64')}` }
}))
await p.setContent(`<style>
  body{margin:0;padding:16px;background:#777;font:600 13px system-ui;color:#fff}
  .fila{display:flex;gap:12px;margin-bottom:18px;align-items:flex-start}
  .c{width:300px;height:300px;display:flex;align-items:center;justify-content:center}
  .c img{max-width:290px;max-height:290px}
  .z{width:420px;height:300px;overflow:hidden;position:relative;background:#05070d}
  .z img{position:absolute;image-rendering:pixelated}
  .damero{background:repeating-conic-gradient(#ccc 0 25%,#fff 0 50%) 0 0/24px 24px}
  h3{margin:0 0 6px}
</style><body>${urls.map((x, k) => `<h3>${x.f}</h3><div class="fila">
  <div class="c" style="background:#05070d"><img src="${x.u}"></div>
  <div class="c" style="background:${fondo}"><img src="${x.u}"></div>
  <div class="c damero"><img src="${x.u}"></div>
  <div class="z" id="z${k}"><img src="${x.u}"></div></div>`).join('')}</body>`)
// El zoom va a la zona del borde con más píxeles semitransparentes (pelo, orejas, cables)
await p.evaluate(async () => {
  for (const z of document.querySelectorAll('.z')) {
    const im = z.querySelector('img'); await im.decode()
    const W = im.naturalWidth, H = im.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H
    const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, W, H).data
    const t = 64; let mejor = [0, 0, -1]
    for (let y = 0; y + t < H; y += t / 2) for (let i = 0; i + t < W; i += t / 2) {
      let n = 0; for (let yy = y; yy < y + t; yy += 2) for (let ii = i; ii < i + t; ii += 2) { const a = d[(yy * W + ii) * 4 + 3]; if (a > 20 && a < 230) n++ }
      if (n > mejor[2]) mejor = [i + t / 2, y + t / 2, n]
    }
    const k = 3; im.style.width = `${W * k}px`; im.style.left = `${210 - mejor[0] * k}px`; im.style.top = `${150 - mejor[1] * k}px`
  }
})
await p.waitForTimeout(200)
await p.locator('body').screenshot({ path: salida })
await nav.close()
console.log(`Hoja de recortes → ${salida}. Ábrela y mira el borde ampliado (300 %) de cada uno.`)
