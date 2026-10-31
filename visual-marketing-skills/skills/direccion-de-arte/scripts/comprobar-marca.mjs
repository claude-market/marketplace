#!/usr/bin/env node
/**
 * comprobar-marca.mjs — revisa un marca.json antes de diseñar nada con él.
 *
 * Uso:
 *   node comprobar-marca.mjs <marca.json>
 *
 * Comprueba que están todos los campos que usan las plantillas, que los colores
 * son hex válidos y que las parejas de color que se van a usar como texto tienen
 * contraste suficiente (WCAG): texto sobre papel, acento-texto sobre papel,
 * claro sobre noche, acento sobre noche, sobre-acento sobre acento, etc.
 * No necesita dependencias.
 *
 * Errores = la marca no se puede usar así. Avisos = se puede, pero mira por qué.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
if (!args.length || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(0)
}
const fichero = path.resolve(args[0])
let m
try { m = JSON.parse(await readFile(fichero, 'utf8')) } catch (e) { console.error(`No puedo leer ${fichero}: ${e.message}`); process.exit(2) }

const errores = [], avisos = []
const obligatorios = ['nombre', 'web', 'web_texto', 'tono', 'logo.svg', 'tipografia.fuente', 'tipografia.google_fonts', 'tipografia.correo']
const colores = ['papel', 'superficie', 'tinta', 'texto', 'suave', 'apagado', 'linea', 'bloque', 'noche', 'noche-2', 'noche-linea', 'claro', 'claro-suave', 'acento', 'acento-texto', 'sobre-acento']
const leer = (o, ruta) => ruta.split('.').reduce((a, k) => (a == null ? a : a[k]), o)

for (const r of obligatorios) if (!leer(m, r)) errores.push(`Falta «${r}»`)
const c = m.colores ?? {}
for (const k of colores) {
  if (!c[k]) errores.push(`Falta el color «${k}»`)
  else if (!/^#[0-9a-f]{6}$/i.test(c[k])) errores.push(`Color «${k}» = ${c[k]}: usa hex de 6 cifras (#rrggbb)`)
}
// Opcionales (tokens de los looks: escena-1/2/3, acento-2, glow…): si no están, las plantillas los derivan del
// acento; si están, tienen que ser hex
for (const [k, v] of Object.entries(c)) {
  if (!colores.includes(k) && !/^#[0-9a-f]{6}$/i.test(String(v))) errores.push(`Color «${k}» = ${v}: usa hex de 6 cifras (#rrggbb)`)
}
// Fuente de titulares de los looks (tipografia.display): tiene que cargarse con google_fonts
const disp = m.tipografia?.display
if (disp && disp !== m.tipografia?.fuente && !String(m.tipografia?.google_fonts ?? '').includes(`family=${disp.replace(/ /g, '+')}`)) {
  errores.push(`La fuente de titulares «${disp}» (tipografia.display) no está en tipografia.google_fonts: no cargará`)
}
if (m.web && !/^https:\/\//.test(m.web)) avisos.push('«web» debería empezar por https://')
if (m.logo?.svg && !/currentColor/.test(m.logo.svg)) avisos.push('El logo SVG no usa currentColor: no cambiará de color entre fondo claro y oscuro')
if (m.logo?.svg && /<(script|foreignObject)/i.test(m.logo.svg)) errores.push('El logo SVG lleva <script> o <foreignObject>')

const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const lum = h => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
// Saturación útil: en colores muy oscuros o muy claros una diferencia mínima entre canales no se ve
const sat = h => { const p = rgb(h).map(v => v / 255); const mx = Math.max(...p), mn = Math.min(...p); return mx - mn < 0.12 ? 0 : (mx - mn) / mx }

// [texto, fondo, mínimo, para qué]
const parejas = [
  ['tinta', 'papel', 7, 'titulares en claro'],
  ['texto', 'papel', 4.5, 'párrafos en claro'],
  ['texto', 'superficie', 4.5, 'párrafos en tarjetas y correo'],
  ['suave', 'papel', 4.5, 'texto de apoyo en claro'],
  ['suave', 'superficie', 4.5, 'texto de apoyo en tarjetas'],
  ['apagado', 'superficie', 3, 'pies y notas (texto pequeño de correo: mejor ≥ 3,5)'],
  ['acento-texto', 'papel', 4.5, 'palabra en color en titulares y etiquetas sobre claro'],
  ['acento-texto', 'superficie', 4.5, 'acento como texto sobre blanco'],
  ['claro', 'noche', 7, 'titulares en oscuro'],
  ['claro-suave', 'noche', 4.5, 'apoyo en oscuro'],
  ['acento', 'noche', 4.5, 'acento como texto sobre oscuro'],
  ['sobre-acento', 'acento', 4.5, 'texto del botón y de las piezas con fondo de acento'],
  ['sobre-escena', 'escena-1', 3, 'titular sobre el degradado (producto en contexto)'],
  ['sobre-escena', 'escena-2', 3, 'titular sobre el degradado, zona media'],
  ['acento-2', 'noche', 3, 'segundo acento (trazos de tech-grid) sobre oscuro'],
]
const filas = []
for (const [t, f, min, uso] of parejas) {
  if (!/^#[0-9a-f]{6}$/i.test(c[t] ?? '') || !/^#[0-9a-f]{6}$/i.test(c[f] ?? '')) continue
  const r = ratio(c[t], c[f])
  const ok = r >= min
  filas.push(`  ${ok ? 'ok' : (min > 4.5 && r >= 4.5 ? '· ' : '✗ ')} ${t.padEnd(13)} sobre ${f.padEnd(11)} ${r.toFixed(2).padStart(5)}:1  (≥ ${min})  ${uso}`)
  if (!ok) (min > 4.5 && r >= 4.5 ? avisos : errores).push(`Contraste ${t} / ${f} = ${r.toFixed(2)}:1 (mínimo ${min}) → ${uso}`)
}
if (c.acento && c.papel && ratio(c.acento, c.papel) < 3) {
  avisos.push(`El acento (${c.acento}) sobre papel da ${ratio(c.acento, c.papel).toFixed(2)}:1: úsalo solo de relleno o sobre oscuro; para texto, «acento-texto»`)
}
for (const k of ['papel', 'superficie', 'tinta', 'texto', 'suave', 'linea', 'noche', 'claro']) {
  if (c[k] && sat(c[k]) > 0.25) avisos.push(`«${k}» (${c[k]}) tiene mucho color para ser un neutro: el estilo sobrio usa neutros + un acento`)
}

console.log(`\nMarca: ${m.nombre ?? '(sin nombre)'}${m.ficticia ? ' (ficticia, de ejemplo)' : ''} · fuente ${m.tipografia?.fuente ?? '?'}`)
console.log(filas.join('\n'))
for (const e of errores) console.log(`  ✗ ${e}`)
for (const a of avisos) console.log(`  · ${a}`)
console.log(`\nResumen: ${errores.length} error(es), ${avisos.length} aviso(s).\n`)
process.exit(errores.length ? 1 : 0)
