# Contexto Funcional: App de Lista de Compras

## Resumen del Proyecto
Aplicación móvil diseñada para gestionar listas de compras de supermercado de forma eficiente. El objetivo principal es reutilizar el historial de compras para no tener que armar la lista desde cero cada vez, registrar qué falta, qué se compró, y llevar un control del gasto total por compra.

## Flujo de Usuario Principal (v2 — flujo de 3 pantallas)
1. **Planificación (Pantalla 1 — Maestro):** El usuario abre la app y ve el listado completo de productos históricos. Por cada producto asigna una **cantidad** (ej: 2 leches, 1 arroz) con un selector +/-; los productos en cantidad 0 no forman parte de la compra actual. También puede agregar productos nuevos que nunca compró antes. El botón principal "Crear lista de compra" navega a la Pantalla 2.
2. **Modo Supermercado (Pantalla 2):** Muestra únicamente los productos con cantidad > 0 seleccionados en la Pantalla 1, cada uno con su cantidad e ícono representativo. Ya en el local, el usuario tilda cada ítem a medida que lo pone en el carrito. También puede agregar ahí mismo productos que no había planificado (nombre + cantidad); quedan sumados al maestro y sin tildar, el usuario los marca igual que al resto.
3. **Cierre de Compra:** Al finalizar, desde la Pantalla 2 el usuario toca "Cerrar compra" e ingresa el importe total gastado. El sistema guarda el registro histórico de esa compra. Los ítems tildados vuelven a cantidad 0 (ya no hacen falta); los que quedaron sin tildar mantienen su cantidad para la próxima compra, sin necesidad de volver a cargarlos.
4. **Historial (Pantalla 3):** Se mantiene la vista de compras cerradas (fecha, total, ítems), ahora con íconos y con la posibilidad de eliminar una compra del historial (con confirmación).

## Actualización (v3): Inteligencia de Precios y Recomendación
* **Cierre de Compra:** además del total gastado, al cerrar la compra (Pantalla 2) el usuario ahora indica obligatoriamente en qué **supermercado** compró (texto libre por ahora, ej. "Devoto", "Tienda Inglesa").
* **Precio por ítem:** en Modo Supermercado, cada ítem de la lista activa suma un campo opcional para cargar su **precio unitario** en el momento de ponerlo en el carrito. Al cerrar la compra, esos precios quedan guardados en el historial de precios del ítem (`priceHistory`), asociados al supermercado y a la fecha de esa compra.
* **Motor de Recomendación (Pantalla 1):** con un botón "Ver sugerencia de ahorro", el usuario puede pedir, antes de salir de compras, en qué supermercado le conviene ir según los precios cargados históricamente para los ítems que tiene seleccionados. El sistema calcula el gasto estimado en cada supermercado (usando el último precio registrado de cada ítem ahí) y muestra un ranking del más barato al más caro, avisando si a algún supermercado le faltan precios de algunos ítems.

## Casos de Uso Clave
* Como usuario, quiero ver todos los ítems de mis compras habituales para indicar rápidamente cuántas unidades me faltan de cada uno.
* Como usuario, quiero poder agregar un ítem nuevo que nunca antes compré.
* Como usuario, quiero ver en el supermercado solo los productos que seleccioné, sin el resto del maestro como distracción.
* Como usuario, quiero poder sumar en el momento algo que compré sin haberlo planificado, con su cantidad.
* Como usuario, quiero ingresar cuánto gasté en total al finalizar en la caja para llevar un registro.
* Como usuario, quiero poder borrar una compra del historial si la cargué mal o ya no me sirve.
* Como usuario, quiero registrar en qué supermercado hice la compra al cerrarla, para poder comparar precios entre distintos lugares.
* Como usuario, quiero cargar el precio de cada producto en el momento de comprarlo, sin que sea obligatorio para todos los ítems.
* Como usuario, quiero saber antes de salir de casa en qué supermercado me conviene hacer la compra según lo que gasté antes en cada lugar.

## Modelo de Datos — Ítems (actualización v2)
* El atributo que antes indicaba si un ítem faltaba (`to_buy` / `purchased`, booleano en la práctica) se reemplaza por un atributo numérico `quantity`: `0` = no forma parte de la compra actual, `> 0` = está incluido con esa cantidad.
* Se incorpora `checked` (booleano) para llevar el tilde de "ya está en el carrito" durante el Modo Supermercado, independiente de la cantidad planificada.

## Modelo de Datos — Ítems (actualización v3)
* Cada ítem suma `priceHistory`: un array de entradas `{ supermarket, price, date }` que se va **agregando** (nunca se pisa) cada vez que se cierra una compra con un precio cargado para ese ítem en ese supermercado. El "último precio conocido" de un ítem en un supermercado se calcula tomando la entrada de fecha más reciente para ese supermercado dentro del array. Sirve tanto para el motor de recomendación como, a futuro, para mostrar la evolución de precios de un producto.

## Modelo de Datos — Compras (actualización v3)
* Cada compra cerrada (`ShoppingTrip`) ahora guarda obligatoriamente el `supermarket` donde se hizo.
* Cada ítem dentro del snapshot de la compra guarda opcionalmente el `price` pagado en ese momento (si se cargó), dejando un registro completo de esa compra puntual además de alimentar el `priceHistory` del ítem.

## Motor de Recomendación (v3)
* Nuevo endpoint `POST /api/recommendation`: recibe la lista de ítems y cantidades seleccionados en Pantalla 1 (`{ items: [{ itemId, quantity }] }`).
* Para cada supermercado presente en el `priceHistory` de esos ítems, calcula el gasto estimado sumando `cantidad × último precio conocido` de cada ítem en ese supermercado, y devuelve el ranking ordenado de más barato a más caro.
* Si a un supermercado le falta el precio de alguno de los ítems pedidos, igual entra al ranking sumando solo lo que tiene precio, e informa cuántos ítems le faltan (`missingItemsCount`). Así hay una sugerencia desde el primer día, aunque los datos de precios todavía sean parciales.

## Evolución Futura (A tener en cuenta)
El modelo de datos de los ítems de la lista debe diseñarse de forma flexible, ya que en el futuro se planea agregar nuevos campos dinámicos (categorización por pasillos, imágenes, etc.). Los precios individuales por supermercado (`priceHistory`) ya se incorporaron en v3.

## Sincronización y Concurrencia
* Al ser una lista familiar compartida, múltiples usuarios (dispositivos) pueden estar interactuando con la misma lista al mismo tiempo.
* **Actualización (v2):** ya no hay refetch automático (se sacó el polling de 5 segundos por resultar molesto en el uso real). La app se actualiza cuando el usuario lo pide explícitamente, deslizando hacia abajo ("pull-to-refresh") en cualquiera de las 3 pantallas. Esto significa que los cambios hechos desde otro dispositivo no aparecen solos; conviene refrescar manualmente antes de empezar a sumar o tildar ítems si puede haber cambios recientes de otro familiar.

## Comportamiento Offline / Mala señal
* La aplicación debe utilizar "Optimistic UI" (Actualizaciones optimistas). Cuando el usuario marca un ítem como comprado, la interfaz debe actualizarse instantáneamente, enviando la petición al servidor en segundo plano. Si la petición falla por falta de internet, debe reintentar o notificar discretamente, pero nunca bloquear al usuario en el momento de la compra.

## Estructura del Repositorio (Monorepo)
El proyecto se organiza bajo un esquema de monorepo con la siguiente estructura de directorios en la raíz (`/`):

*   `/backend`: Contiene exclusivamente el código del servidor (Node.js, Express, TypeScript, Mongoose). Render utilizará este directorio como su "Root Directory" para los despliegues.
*   `/frontend`: Contiene exclusivamente el código de la aplicación móvil (React Native con Expo).
*   Los archivos de documentación y contexto (`*.md`) residen en la raíz para instruir al agente.

**Regla de ejecución:** Todas las dependencias, inicializaciones (`package.json`, `tsconfig.json`) y scripts deben ejecutarse de forma aislada dentro de sus respectivas carpetas (`/backend` o `/frontend`). No se debe generar código fuente ni configuraciones de entorno en la raíz del proyecto.