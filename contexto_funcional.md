# Contexto Funcional: App de Lista de Compras

## Resumen del Proyecto
Aplicación móvil diseñada para gestionar listas de compras de supermercado de forma eficiente. El objetivo principal es reutilizar el historial de compras para no tener que armar la lista desde cero cada vez, registrar qué falta, qué se compró, y llevar un control del gasto total por compra.

## Flujo de Usuario Principal (v2 — flujo de 3 pantallas)
1. **Planificación (Pantalla 1 — Maestro):** El usuario abre la app y ve el listado completo de productos históricos. Por cada producto asigna una **cantidad** (ej: 2 leches, 1 arroz) con un selector +/-; los productos en cantidad 0 no forman parte de la compra actual. También puede agregar productos nuevos que nunca compró antes. El botón principal "Crear lista de compra" navega a la Pantalla 2.
2. **Modo Supermercado (Pantalla 2):** Muestra únicamente los productos con cantidad > 0 seleccionados en la Pantalla 1, cada uno con su cantidad e ícono representativo. Ya en el local, el usuario tilda cada ítem a medida que lo pone en el carrito.
3. **Cierre de Compra:** Al finalizar, desde la Pantalla 2 el usuario toca "Cerrar compra" e ingresa el importe total gastado. El sistema guarda el registro histórico de esa compra. Los ítems tildados vuelven a cantidad 0 (ya no hacen falta); los que quedaron sin tildar mantienen su cantidad para la próxima compra, sin necesidad de volver a cargarlos.
4. **Historial (Pantalla 3):** Se mantiene la vista de compras cerradas (fecha, total, ítems), ahora con íconos y con la posibilidad de eliminar una compra del historial (con confirmación).

## Casos de Uso Clave
* Como usuario, quiero ver todos los ítems de mis compras habituales para indicar rápidamente cuántas unidades me faltan de cada uno.
* Como usuario, quiero poder agregar un ítem nuevo que nunca antes compré.
* Como usuario, quiero ver en el supermercado solo los productos que seleccioné, sin el resto del maestro como distracción.
* Como usuario, quiero ingresar cuánto gasté en total al finalizar en la caja para llevar un registro.
* Como usuario, quiero poder borrar una compra del historial si la cargué mal o ya no me sirve.

## Modelo de Datos — Ítems (actualización v2)
* El atributo que antes indicaba si un ítem faltaba (`to_buy` / `purchased`, booleano en la práctica) se reemplaza por un atributo numérico `quantity`: `0` = no forma parte de la compra actual, `> 0` = está incluido con esa cantidad.
* Se incorpora `checked` (booleano) para llevar el tilde de "ya está en el carrito" durante el Modo Supermercado, independiente de la cantidad planificada.

## Evolución Futura (A tener en cuenta)
El modelo de datos de los ítems de la lista debe diseñarse de forma flexible, ya que en el futuro se planea agregar nuevos campos dinámicos (categorización por pasillos, precios individuales, imágenes, etc.).

## Sincronización y Concurrencia
* Al ser una lista familiar compartida, múltiples usuarios (dispositivos) pueden estar interactuando con la misma lista al mismo tiempo. 
* La interfaz debe reflejar los cambios realizados por otro dispositivo lo más rápido posible para evitar compras duplicadas.

## Comportamiento Offline / Mala señal
* La aplicación debe utilizar "Optimistic UI" (Actualizaciones optimistas). Cuando el usuario marca un ítem como comprado, la interfaz debe actualizarse instantáneamente, enviando la petición al servidor en segundo plano. Si la petición falla por falta de internet, debe reintentar o notificar discretamente, pero nunca bloquear al usuario en el momento de la compra.

## Estructura del Repositorio (Monorepo)
El proyecto se organiza bajo un esquema de monorepo con la siguiente estructura de directorios en la raíz (`/`):

*   `/backend`: Contiene exclusivamente el código del servidor (Node.js, Express, TypeScript, Mongoose). Render utilizará este directorio como su "Root Directory" para los despliegues.
*   `/frontend`: Contiene exclusivamente el código de la aplicación móvil (React Native con Expo).
*   Los archivos de documentación y contexto (`*.md`) residen en la raíz para instruir al agente.

**Regla de ejecución:** Todas las dependencias, inicializaciones (`package.json`, `tsconfig.json`) y scripts deben ejecutarse de forma aislada dentro de sus respectivas carpetas (`/backend` o `/frontend`). No se debe generar código fuente ni configuraciones de entorno en la raíz del proyecto.