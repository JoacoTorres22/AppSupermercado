import { NextFunction, Request, Response } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const providedKey = req.header("x-api-key");
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    res.status(500).json({ error: "API_KEY no configurada en el servidor" });
    return;
  }

  if (!providedKey || providedKey !== expectedKey) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  next();
}
