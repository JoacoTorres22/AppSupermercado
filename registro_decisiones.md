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
* **⚠️ Superada por la Decisión 17:** el polling automático se eliminó en v2 a favor de refresh manual.

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

## Decisión 14: Network Access de MongoDB Atlas abierto a cualquier IP
* **Contexto:** El backend deployado en Render (tier gratuito) no tiene una IP de salida estática, por lo que no se puede whitelistear una IP fija en Atlas. Con la whitelist restringida al IP local de desarrollo, el deploy en Render fallaba con `MongooseServerSelectionError`.
* **Decisión:** Se configuró el Network Access de MongoDB Atlas como "Allow Access from Anywhere" (`0.0.0.0/0`).
* **Consecuencias:** El control de acceso a la base queda en manos del usuario/contraseña de conexión (string de Atlas) y, para la capa HTTP, del API Key estático (Decisión 4). Es un trade-off aceptable dado el alcance familiar y gratuito del proyecto, pero implica rotar las credenciales de Atlas si llegaran a filtrarse.

## Decisión 15: Build local del APK en vez de EAS Build
* **Contexto:** Había que elegir cómo generar el instalable de Android para probarlo en el celular: compilar en la nube con EAS Build (requiere cuenta de Expo y depende de una cola de build compartida) o localmente, aprovechando que la máquina ya tenía Java y el Android SDK instalados.
* **Decisión:** Se usa build local: `npx expo prebuild -p android` + `./gradlew assembleRelease`.
* **Consecuencias:** No depende de crear una cuenta de Expo ni de límites del free tier de EAS, pero el APK queda firmado con el keystore de debug (no apto para Google Play) y el build consume tiempo/recursos de la máquina local (~15 minutos la primera vez, por la descarga de dependencias y compilación nativa de C++).

## Decisión 16: Identidad de la app (nombre y package de Android)
* **Contexto:** El scaffold de Expo no traía definido un nombre de producto ni un `android.package`, ambos requeridos para poder compilar un APK instalable (`expo prebuild` falla sin un package id válido).
* **Decisión:** Nombre de la app: "App Supermercado". Package de Android: `com.studio4d.appsupermercado`.
* **Consecuencias:** Cambiar el `android.package` más adelante obligaría a desinstalar y reinstalar la app en los dispositivos (no hay upgrade in-place entre package ids distintos), por lo que conviene tratarlo como definitivo.

## Decisión 17: Eliminación del polling automático (refresh manual)
* **Contexto:** El polling cada 5 segundos definido en la Decisión 5 resultó molesto en el uso real: la app refrescaba todo el tiempo aunque nadie más estuviera editando la lista.
* **Decisión:** Se saca el `refetchInterval` de React Query. La sincronización pasa a ser manual: cada pantalla (Planificación, Modo Supermercado, Historial) ya tenía "pull-to-refresh" (deslizar hacia abajo) conectado a `refetch()`, que ahora es la única forma de traer cambios hechos desde otro dispositivo.
* **Consecuencias:** Se resigna parte del objetivo original de la Decisión 5 (reflejar cambios de otros dispositivos "lo más rápido posible", ver `contexto_funcional.md`) a cambio de una experiencia menos intrusiva. El riesgo de compras duplicadas entre dispositivos familiares aumenta levemente si no se actualiza manualmente antes de sumar ítems; se acepta el trade-off dado el uso real de la app (bajo volumen, pocos dispositivos). Las actualizaciones optimistas post-mutación (marcar ítem, cerrar compra, etc.) siguen funcionando igual, ya que no dependen del polling.

## Decisión 18: Alta de productos no planificados desde Modo Supermercado
* **Contexto:** En Modo Supermercado el usuario solo podía tildar ítems que ya estaban en la lista armada desde Planificación; no había forma de sumar algo que se compró sin haberlo planificado (una compra de último momento).
* **Decisión:** Se agrega un formulario rápido (nombre + cantidad) en Modo Supermercado que crea el ítem directo en el maestro de productos (reutilizando `POST /api/items`, que ya soportaba `quantity` en el body). **Consultado con el usuario:** el ítem se agrega **sin tildar** — el usuario lo marca como comprado con el mismo tap que usa para el resto de la lista, en vez de quedar tildado automáticamente.
* **Consecuencias:** No hizo falta ningún endpoint nuevo en el backend. El ítem queda en el maestro para futuras planificaciones, igual que cualquier otro (Decisión 3). Como no queda tildado por default, un ítem agregado acá y no tildado por error no entraría en el snapshot de la compra al cerrarla.