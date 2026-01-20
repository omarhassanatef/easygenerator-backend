import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { setContext } from "../contexts/app.context";

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = (req.headers["x-trace-id"] as string) || randomUUID();
    const requestId = randomUUID();

    setContext({
      traceId,
      requestId,
    });

    res.setHeader("x-trace-id", traceId);
    res.setHeader("x-request-id", requestId);

    next();
  }
}
