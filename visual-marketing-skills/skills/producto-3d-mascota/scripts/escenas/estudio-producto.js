// Estudio común de los productos (teclado, ratón, cascos) de tech-grid y producto-3d-mascota: mismo render, mismo blanco y la misma luz (relativa a la cámara),
// para que ratón, teclado y cascos parezcan de la misma sesión de fotos.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// Parámetros de la URL (render-3d.mjs --param clave=valor); colores en hex sin #
const _q = new URLSearchParams(location.search)
const _c = (k, d) => (_q.has(k) ? parseInt(_q.get(k).replace('#', ''), 16) : d)
export const BLANCO = _c('cuerpo', 0xe3e6ea)   // cuerpo (plástico blanco por defecto; 1c1f26 = negro mate)
export const OSCURO = _c('oscuro', 0x161a21)   // piezas oscuras (ruedas, juntas, huecos)
export const RGB1 = _c('rgb1', 0x2f86ff)       // luz RGB: de un color…
export const RGB2 = _c('rgb2', 0x9a55ff)       // …a otro
export const ACENTO = _q.has('acento') ? _c('acento', 0) : null   // una pieza en el color de la marca
export const GIRO = Number(_q.get('giro') || 0)  // giro extra del producto, en radianes
export const CLARO = new THREE.Color(BLANCO).getHSL({}).l > 0.5   // cuerpo claro u oscuro (leyendas, carcasa)

export function preparar() {
  const q = new URLSearchParams(location.search), W = +q.get('w'), H = +q.get('h')
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  r.setPixelRatio(1); r.setSize(W, H); r.setClearColor(0x000000, 0)
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.92
  document.body.appendChild(r.domElement)
  const s = new THREE.Scene()
  const pm = new THREE.PMREMGenerator(r)
  s.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
  s.environmentIntensity = Number(new URLSearchParams(location.search).get("env") || 0.14)
  return { r, s, W, H }
}

// Luces en el marco de la cámara (x derecha, y arriba, z hacia quien mira): llave cálida arriba a la izquierda,
// recorte azul detrás a la derecha (el color del fondo) y un relleno frío suave a la derecha.
export function luces(s, c) {
  c.updateMatrixWorld()
  const pon = (color, int, x, y, z) => {
    const l = new THREE.DirectionalLight(color, int)
    l.position.copy(new THREE.Vector3(x, y, z).normalize().applyQuaternion(c.quaternion).multiplyScalar(20))
    s.add(l); s.add(l.target)
  }
  pon(0xfff6ec, 2.2, -0.55, 0.75, 0.55)
  pon(_c('recorte', 0x3d9bff), 3.0, 0.7, 0.3, -0.75)   // recorte: el color del fondo del look
  pon(0xdfe9ff, 0.22, 0.85, -0.05, 0.6)
}

// Cámara que encuadra el objeto desde una dirección, con «arriba» de la imagen opcional (para girar el producto)
export function camara(obj, W, H, dir, arriba = [0, 1, 0], fov = 24, margen = 0.9) {
  const c = new THREE.PerspectiveCamera(fov, W / H, 0.1, 500)
  const caja = new THREE.Box3().setFromObject(obj), esf = caja.getBoundingSphere(new THREE.Sphere())
  const d = new THREE.Vector3(...dir).normalize()
  c.up.set(...arriba).normalize()
  c.position.copy(esf.center).addScaledVector(d, esf.radius / Math.sin(THREE.MathUtils.degToRad(fov / 2)) * margen)
  c.lookAt(esf.center)
  return c
}
