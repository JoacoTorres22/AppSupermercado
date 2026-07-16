# Contexto Funcional: App de Lista de Compras

## Resumen del Proyecto
Aplicación móvil diseñada para gestionar listas de compras de supermercado de forma eficiente. El objetivo principal es reutilizar el historial de compras para no tener que armar la lista desde cero cada vez, registrar qué falta, qué se compró, y llevar un control del gasto total por compra.

## Flujo de Usuario Principal
1. **Creación/Apertura de Lista:** Al iniciar una nueva compra, la lista debe cargar automáticamente los ítems registrados en compras anteriores (estado "por comprar" o desmarcados).
2. **Gestión de Ítems:** El usuario puede agregar nuevos ítems a la lista. La base de datos debe ser lo suficientemente flexible para soportar futuros atributos en los ítems (ej: notas, cantidad, marca).
3. **Durante la Compra:** El usuario marca los ítems a medida que los pone en el carrito (cambian a estado "comprado").
4. **Cierre de Compra:** Al finalizar, el usuario toca un botón para "Cerrar compra". El sistema debe solicitar el importe total gastado, guardar el registro histórico de esa compra y resetear los ítems para la próxima.

## Casos de Uso Clave
* Como usuario, quiero ver todos los ítems de mis compras habituales para marcar rápidamente qué me falta.
* Como usuario, quiero poder agregar un ítem nuevo que nunca antes compré.
* Como usuario, quiero ingresar cuánto gasté en total al finalizar en la caja para llevar un registro.

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