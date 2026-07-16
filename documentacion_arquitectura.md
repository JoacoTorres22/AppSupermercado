# Documentación de Arquitectura

## Stack Tecnológico Elegido
* **Frontend (Mobile App):** React Native (con Expo).
* **Backend:** Node.js con Express. Escrito en TypeScript.
* **Gestor de Paquetes:** npm.
* **Base de Datos:** MongoDB, utilizando Mongoose como ODM.
* **Alojamiento (Hosting):** 
  * Backend: Render (Web Service gratuito).
  * Base de Datos: MongoDB Atlas (Free Tier M0).

## Patrón de Arquitectura
Arquitectura Cliente-Servidor separada.
1. **API RESTful:** El backend en Node.js expondrá endpoints para manejar los ítems (CRUD) y el registro de los tickets/compras finalizadas.
2. **Base de Datos:** Se utilizará un modelo de documentos NoSQL para permitir flexibilidad en los esquemas de la lista de compras.
3. **Cliente:** La app móvil consumirá la API. El estado de la aplicación debe manejarse de forma que funcione fluida incluso si la API tiene un "cold start" (retraso inicial de respuesta desde Render).

## Estructura de Datos (Borrador inicial)
* Colección `Items`: Almacena el diccionario de productos históricos del usuario.
* Colección `ShoppingTrips` (o Compras): Almacena el registro de compras cerradas, la fecha y el total gastado ($).

4. **Seguridad de la API:** Al no existir autenticación de usuarios (login), la API RESTful estará protegida mediante un "Shared Secret" (API Key estática). La app móvil enviará este token en los headers (`x-api-key`) de todas las peticiones, y el backend rechazará cualquier request que no lo incluya.

5. **Manejo de Estado Remoto:** Para manejar la concurrencia familiar y las actualizaciones optimistas, el frontend en React Native deberá utilizar una librería de data-fetching como React Query (@tanstack/react-query) o SWR. Se configurará un "polling" (ej. refetch cada 5 segundos) mientras la app esté en primer plano para simular tiempo real sin necesidad de montar WebSockets.


