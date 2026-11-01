#!/usr/bin/env node
/**
 * aplicar-marca.mjs — rellena una plantilla de correo con los datos de una marca.
 *
 * Uso:
 *   node aplicar-marca.mjs <plantilla.html> <marca.json> [-o <salida.html>]
 *
 * En los correos no hay variables CSS (Gmail y Outlook no las entienden), así que las plantillas llevan
 * marcadores %%ruta%% que apuntan a un campo de marca.json (skill direccion-de-arte):
 *   %%nombre%%  %%web%%  %%web_texto%%  %%correo_contacto%%  %%tipografia.correo%%
 *   %%colores.tinta%%  %%colores.acento%%  %%colores.sobre-acento%%  … (cualquier campo de texto)
 * Este script los sustituye y escribe un HTML listo para comprobar con comprobar-correo.mjs.
 * Si queda algún marcador que la marca no tiene, falla y dice cuál.
 *
 * Por defecto escribe ./<plantilla>-<marca>.html en la carpeta actual.
 * Las {{etiquetas}} de combinación ({{nombre}}, {{url_baja}}) no se tocan: las rellena tu motor de envío.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
if (args.length < 2 || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(args.length < 2 ? 2 : 0)
}
const [plantilla, ficheroMarca] = args.map(a => path.resolve(a))
const i = args.indexOf('-o')
const slug = s => String(s ?? 'marca').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const html = await readFile(plantilla, 'utf8')
let marca
try { marca = JSON.parse(await readFile(ficheroMarca, 'utf8')) } catch (e) { console.error(`No puedo leer ${ficheroMarca}: ${e.message}`); process.exit(2) }
const salida = i >= 0 && args[i + 1] ? path.resolve(args[i + 1])
  : path.resolve(`${path.basename(plantilla, path.extname(plantilla))}-${slug(marca.nombre)}.html`)

const leer = ruta => ruta.split('.').reduce((a, k) => (a == null ? a : a[k]), marca)
const escapar = v => String(v).replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const faltan = new Set()
const resultado = html.replace(/%%([\w.-]+)%%/g, (todo, ruta) => {
  const v = leer(ruta)
  if (typeof v !== 'string' && typeof v !== 'number') { faltan.add(ruta); return todo }
  // La pila tipográfica va dentro de style="…": las comillas dobles romperían el atributo
  return ruta.startsWith('tipografia.') ? String(v).replace(/"/g, "'") : escapar(v)
})
if (faltan.size) {
  console.error(`La marca no tiene: ${[...faltan].join(', ')}. Añádelos a ${path.basename(ficheroMarca)} o quita el marcador.`)
  process.exit(1)
}
await writeFile(salida, resultado)
const n = (html.match(/%%[\w.-]+%%/g) ?? []).length
console.log(`${n} marcador(es) de ${marca.nombre} aplicados → ${salida}`)
console.log('Ahora: node comprobar-correo.mjs <ese fichero> --marketing  (y mira las 4 vistas)')
