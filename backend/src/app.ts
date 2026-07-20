import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import { apiKeyAuth } from "./middleware/apiKeyAuth";
import itemsRoutes from "./routes/items.routes";
import recommendationRoutes from "./routes/recommendation.routes";
import tripsRoutes from "./routes/trips.routes";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Sin autenticación de usuarios (single-tenant): health check público para
  // que Render pueda hacer ping sin necesitar la API key.
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(apiKeyAuth);

  app.use("/api/items", itemsRoutes);
  app.use("/api/trips", tripsRoutes);
  app.use("/api/recommendation", recommendationRoutes);

  return app;
}
