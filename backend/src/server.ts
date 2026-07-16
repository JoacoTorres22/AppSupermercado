import "dotenv/config";
import { createApp } from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT ?? 3000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  await connectDB(MONGODB_URI);

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Error al iniciar el servidor:", err);
  process.exit(1);
});
