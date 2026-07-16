# Registro de Decisiones Arquitectónicas (ADR)

## Decisión 1: Uso de MongoDB como Base de Datos
* **Contexto:** La aplicación necesita guardar ítems de supermercado. Es altamente probable que en el futuro los ítems requieran nuevos atributos (categorías, fotos, marcas, tags).
* **Decisión:** Se opta por MongoDB (vía MongoDB Atlas).
* **Consecuencias:** El esquema flexible (NoSQL) permite agregar campos dinámicos sin necesidad de realizar migraciones complejas en la base de datos. Costo $0 en la capa inicial.

## Decisión 2: Hosting del Backend en Render
* **Contexto:** Se necesita desplegar el backend en Node.js para que la app sea 100% funcional y consumible desde un dispositivo físico, sin incurrir en costos iniciales.
* **Decisión:** Se utilizará el Web Service gratuito de Render.
* **Consecuencias:** Despliegue automático vía GitHub. Se asume el trade-off del "cold start" (el servidor entra en reposo tras 15 minutos de inactividad). La app móvil deberá manejar visualmente este posible retraso en la primera carga.

## Decisión 3: Carga histórica automática
* **Contexto:** El usuario no quiere tipear la lista desde cero cada vez.
* **Decisión:** La base de datos actuará como un "maestro de artículos". Al iniciar una compra, se visualizará el listado general y el usuario simplemente activará qué necesita para el viaje actual, pudiendo agregar elementos nuevos al maestro.

## Decisión 4: Ausencia de Sistema de Usuarios (Single-Tenant)
* **Contexto:** La app es de uso interno familiar. Implementar un sistema de registro/login (JWT, OAuth) añade fricción innecesaria y tiempo de desarrollo.
* **Decisión:** No habrá autenticación por usuario. Todos los dispositivos operan sobre la misma "Lista Global".
* **Consecuencias:** Se requiere usar un API Key estática embebida en la app para proteger los endpoints. No se sabrá "quién" agregó un ítem, lo cual es aceptable para este alcance.

## Decisión 5: Polling vs WebSockets para tiempo real
* **Contexto:** Múltiples familiares pueden editar la lista a la vez.
* **Decisión:** Se utilizará Short-Polling (consultas periódicas desde el cliente) apoyado en React Query, en lugar de WebSockets.
* **Consecuencias:** Simplifica enormemente el despliegue y la lógica del backend en Render (los WebSockets en tiers gratuitos suelen desconectarse o ser difíciles de escalar). Aumenta la cantidad de peticiones HTTP, pero el volumen es ínfimo por ser una app familiar.

## Decisión 6: Elección de Framework Backend y Lenguaje
* **Contexto:** Se necesitaba definir el framework principal para el servidor Node.js y el lenguaje de programación.
* **Decisión:** Se utilizará Express y el código estará escrito en TypeScript.
* **Consecuencias:** Express garantiza un entorno maduro y estándar. TypeScript añade seguridad mediante el tipado estático, lo cual previene errores en tiempo de ejecución y mejora la escalabilidad del código.

## Decisión 7: Interacción con la Base de Datos
* **Contexto:** Definir cómo el backend se comunicará con MongoDB Atlas.
* **Decisión:** Se implementará Mongoose (ODM con schemas).
* **Consecuencias:** Aunque MongoDB es flexible, Mongoose permite establecer validaciones a nivel de aplicación, asegurando que los datos de la lista de compras mantengan una estructura coherente antes de guardarse.

## Decisión 8: Gestor de Paquetes
* **Contexto:** Se requería estandarizar la herramienta para instalar y gestionar las librerías del proyecto.
* **Decisión:** Se utilizará npm.
* **Consecuencias:** Asegura la compatibilidad directa con la mayoría de las dependencias de Node.js y React Native, unificando la ejecución de scripts bajo una herramienta estándar.

## Decisión 9: Reseteo automático del estado de ítems al cerrar la compra
* **Contexto:** Al cerrar una compra, hay que decidir qué pasa con los ítems que quedaron marcados como "purchased": si vuelven solos a estar disponibles para el próximo viaje o si el usuario debe reactivarlos manualmente.
* **Decisión:** El endpoint de cierre (`POST /api/trips`) resetea automáticamente a `to_buy` todos los ítems que estaban en `purchased`, después de guardar el snapshot de la compra en `ShoppingTrips`.
* **Consecuencias:** El maestro de artículos siempre refleja lo pendiente sin pasos manuales extra por parte del usuario, en línea con el objetivo de no re-tipear la lista cada vez (Decisión 3).

## Decisión 10: React Query como librería de manejo de estado remoto
* **Contexto:** La documentación dejaba abierta la elección entre React Query y SWR para el polling y las actualizaciones optimistas del frontend.
* **Decisión:** Se utiliza `@tanstack/react-query`.
* **Consecuencias:** Da soporte nativo a mutaciones optimistas (`onMutate`/`onError`/`onSettled`), necesarias para que marcar un ítem se sienta instantáneo (Optimistic UI). El polling se configura vía `refetchInterval: 5000` en el `QueryClient`, en línea con la Decisión 5.

## Decisión 11: TypeScript en el frontend
* **Contexto:** El backend ya se había definido en TypeScript; faltaba decidir el lenguaje de la app Expo.
* **Decisión:** La app móvil también se escribe en TypeScript.
* **Consecuencias:** Consistencia con el backend y tipado de las formas de `Item`/`ShoppingTrip` en el cliente, reduciendo errores de integración con la API.

## Decisión 12: Estructura de navegación (Lista + Historial)
* **Contexto:** El documento funcional solo describía el flujo de la lista activa, sin definir si existía una vista separada para revisar compras cerradas.
* **Decisión:** Se usa Expo Router con dos pestañas: "Lista" (pantalla principal, maestro de ítems) e "Historial" (compras cerradas, con fecha, total e ítems comprados).
* **Consecuencias:** El Historial consume el endpoint `GET /api/trips` ya expuesto por el backend; la navegación queda basada en archivos (`src/app/index.tsx`, `src/app/historial.tsx`).

## Decisión 13: Tabs estándar en vez de NativeTabs experimental
* **Contexto:** El scaffold inicial generado por `create-expo-app` (SDK 57) traía tabs basados en `NativeTabs`, una API todavía experimental/inestable de expo-router, junto con componentes y dependencias de demo (glass effect, animaciones, imágenes tutorial) pensados para mostrar features de Expo, no para producción.
* **Decisión:** Se removieron los componentes y dependencias de demo, reemplazando `NativeTabs` por el componente `<Tabs>` estándar y estable de expo-router.
* **Consecuencias:** Proyecto más liviano y predecible de mantener; se evita depender de una API inestable, a costa de un tab bar con apariencia algo menos nativa/pulida que `NativeTabs`.