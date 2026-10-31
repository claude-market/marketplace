# Componentes de `producto.css` (catálogo)

Todo en `em`: el `font-size` del componente lo escala. Colores solo con `var(--…)`. Cada capa lleva `data-maqueta`.

## Lienzo
```html
<section class="escena" data-pieza="hero" data-estilo="producto" data-ancho="1600" data-alto="900"
         style="width:1600px;height:900px;--radio-escena:26px"> … </section>
```
Variantes: `escena malla` (manchas), `escena clara` (papel con tintes), `escena noche` (oscuro con bruma).
Tokens opcionales en `marca.json` → `colores`: `escena-1`, `escena-2`, `escena-3`, `sobre-escena`, `ok`,
`pendiente`, `vencida`.

## Ventana de app
```html
<div class="ventana" data-maqueta style="font-size:20px;left:176px;top:124px;width:1560px;height:900px;--sangra-d:136px;--sangra-a:124px">
  <aside class="ui-lateral">
    <div class="ui-marca"><span class="ui-logo" data-marca="logo">…svg…</span><span data-marca="nombre">Marca</span><svg class="i"><use href="#i-panel"/></svg></div>
    <div class="ui-item activo"><svg class="i"><use href="#i-factura"/></svg>Facturas<span class="ui-num">24</span></div>
    <p class="ui-seccion">Clientes<svg class="i"><use href="#i-mas"/></svg></p>
    <div class="ui-item"><span class="ui-punto" style="--tono:var(--ok)"></span>Café Lumbre</div>
  </aside>
  <main class="ui-principal">
    <div class="ui-barra"><div class="ui-buscador"><svg class="i"><use href="#i-buscar"/></svg>Buscar<kbd>⌘K</kbd></div></div>
    <div class="ui-cab"><p class="titulo-ui">Facturas</p><span class="ui-boton">Nueva</span></div>
    <div class="ui-pestanas"><span class="activa">Todas</span><span>Pagadas</span></div>
    <div class="ui-lista atenuado">
      <div class="ui-fila"><span class="ui-avatar" style="--tono:var(--ok)">CL</span><div class="ui-quien"><b>Café Lumbre</b><small>F-2026-119</small></div><span class="ui-eur">480 €</span><span class="ui-chip">Enviada</span></div>
      <div class="ui-fila oculta">… (la que va destacada encima) …</div>
    </div>
  </main>
</div>
```
`ventana clara` para el modo claro. Sin `.ui-lateral` queda una ventana compacta (banner, miniatura, story).
`.ui-accion` (con `--tono`) son los botones teñidos de fondo, como los de «crear» detrás de un modal.

## Capas flotantes
```html
<!-- Fila destacada: encima de su fila, saliendo ~2 em por la izquierda de la ventana -->
<div class="flotante destacada" data-maqueta data-sobre=".ui-fila.oculta" style="font-size:22px;left:136px;top:560px;width:720px">
  <span class="ui-avatar">EM</span><div class="ui-quien"><b>Estudio Marea</b><small>Cobrada en 6 días</small></div>
  <span class="ui-eur">1.250,00 €</span><span class="ui-chip ok">Pagada</span>
</div>
<!-- Modal: arriba a la derecha, sangrando (el padding suma lo que sale) -->
<div class="flotante modal" data-maqueta style="font-size:22px;left:1000px;top:96px;width:660px;padding-right:calc(1.45em + 60px)">
  <p class="modal-cab"><svg class="i"><use href="#i-reloj"/></svg>Recordatorios<svg class="i cerrar"><use href="#i-cerrar"/></svg></p>
  <div class="ui-campo foco"><label>Primer aviso</label><span>3 días después<svg class="i"><use href="#i-abajo"/></svg></span></div>
  <div class="ui-opcion"><span>Avisarme si sigue sin pagar</span><span class="ui-interruptor"></span></div>
  <div class="modal-acciones"><span class="ui-boton sec">Cancelar</span><span class="ui-boton">Activar</span></div>
</div>
<!-- Aviso -->
<div class="flotante toast" data-maqueta style="font-size:23px;left:470px;top:440px">
  <span class="toast-ico"><svg class="i"><use href="#i-check"/></svg></span><div><b>Pago recibido</b><small>Estudio Marea</small></div><span class="hora">ahora</span>
</div>
```
`flotante clara` para capas blancas; `flotante neutra` quita el degradado del borde (segunda capa cuando las dos
compiten). Chips: `ok`, `pendiente`, `vencida`, `marca`, o `--tono` propio. `.cursor` dibuja el cursor de texto.

## Iconos (`producto.js`)
buscar · inicio · factura · presupuesto · clientes · usuario · gastos · informes · ajustes · mas · cerrar · reloj ·
campana · check · check-circulo · tarjeta · enviar · carpeta · abajo · derecha · flecha · rejilla · panel · filtro ·
calendario · puntos · enlace · candado · mensaje · correo · rayo · repetir · descarga · nube · estrella · escudo ·
grafico · archivo · editar. Uso: `<svg class="i"><use href="#i-nombre"/></svg>`; `.i.relleno` para rellenos.
