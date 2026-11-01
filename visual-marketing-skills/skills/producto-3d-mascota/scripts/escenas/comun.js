// Base común de las escenas del look «producto-3d-mascota» (p3m-*): renderizador transparente con ACES, entorno de
// estudio (RoomEnvironment), luces de recorte azul y violeta (las del fondo del banner) y encuadre automático.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export const q = new URLSearchParams(location.search)
export const W = +q.get('w') || 1600, H = +q.get('h') || 1600

export function preparar({ entorno = 0.55, exposicion = 1 } = {}) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  r.setSize(W, H); r.setClearColor(0x000000, 0)
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = exposicion
  r.outputColorSpace = THREE.SRGBColorSpace
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap
  document.body.appendChild(r.domElement)
  const s = new THREE.Scene()
  const pm = new THREE.PMREMGenerator(r)
  s.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
  s.environmentIntensity = entorno
  return { r, s }
}

// Luz de estudio: principal cálida-neutra arriba a la derecha (con sombra), relleno suave y dos recortes de color
// desde atrás (azul a la izquierda, violeta a la derecha): es lo que pega el sujeto al degradado del banner.
export function luces(s, { principal = 1.7, relleno = .45, azul = 6, violeta = 6, colorAzul = q.has('azul') ? '#' + q.get('azul') : '#4d6cff', colorVioleta = q.has('violeta') ? '#' + q.get('violeta') : '#a95cff' } = {}) {
  const k = new THREE.DirectionalLight('#fff6ee', principal); k.position.set(3, 4, 5); k.castShadow = true
  k.shadow.mapSize.set(2048, 2048); k.shadow.bias = -0.0004; k.shadow.normalBias = 0.02; k.shadow.radius = 6
  Object.assign(k.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .5, far: 20 })
  s.add(k)
  const f = new THREE.DirectionalLight('#cfc8ff', relleno); f.position.set(-4, 1, 3); s.add(f)
  const a = new THREE.DirectionalLight(colorAzul, azul); a.position.set(-5, 2.5, -4); s.add(a)
  const v = new THREE.DirectionalLight(colorVioleta, violeta); v.position.set(5, 1.5, -4); s.add(v)
  const b = new THREE.DirectionalLight('#6a52ff', .6); b.position.set(0, -4, 2); s.add(b)
  return { k, f, a, v, b }
}

// Encuadra el objeto con un margen (fracción del lado) y devuelve la cámara.
export function encuadrar(obj, { fov = 24, margen = .06, elevacion = .08 } = {}) {
  const c = new THREE.PerspectiveCamera(fov, W / H, .1, 100)
  const caja = new THREE.Box3().setFromObject(obj), centro = caja.getCenter(new THREE.Vector3()), tam = caja.getSize(new THREE.Vector3())
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2))
  const d = Math.max(tam.y / 2 / t, tam.x / 2 / (t * W / H)) * (1 + margen * 2) + tam.z / 2
  c.position.set(centro.x, centro.y + d * elevacion, centro.z + d); c.lookAt(centro)
  return c
}

export function sombras(obj) { obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } }) }
export { THREE }

// Estudio con la luz de la marca para el reflejo (environment): sala oscura índigo con un softbox blanco arriba,
// un panel azul a la izquierda, uno violeta a la derecha y un relleno blanco suave delante. Las superficies
// blancas y lacadas recogen el color del fondo del banner (es lo que integra el producto en la pieza).
export function estudioMarca(r, { azul = '#4d6cff', violeta = '#a95cff', base = '#1b1650', fuerza = 1 } = {}) {
  const e = new THREE.Scene()
  const sala = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: base, side: THREE.BackSide })); sala.position.y = 3; e.add(sala)
  const panel = (w, h, color, k, pos, mira) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k * fuerza), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(...mira); e.add(m) }
  panel(8, 5, '#ffffff', 6, [0, 8.5, 1], [0, 0, 0])          // softbox cenital
  panel(5, 7, azul, 9, [-9.5, 2.5, -2], [0, 1, 0])            // azul, izquierda-atrás
  panel(5, 7, violeta, 9, [9.5, 2, -2], [0, 1, 0])            // violeta, derecha-atrás
  panel(7, 3, '#ffffff', 2.2, [1.5, 2.5, 9.5], [0, 1, 0])     // relleno frontal
  panel(10, 2, violeta, 2.5, [0, -2.9, 3], [0, 1, 0])         // rebote del suelo, violeta suave
  const pm = new THREE.PMREMGenerator(r)
  return pm.fromScene(e, .02).texture
}
