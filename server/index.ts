import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { setupVite } from "./vite.js";
import { createServer } from "http";

const app = express();

// 🔒 BLOCK SENSITIVE PATHS (MUST BE FIRST MIDDLEWARE)
app.use((req, res, next) => {
  const url = decodeURIComponent(req.url.toLowerCase());

  if (
    process.env.NODE_ENV === "development" &&
    (
      url.startsWith("/@vite") ||
      url.startsWith("/@fs/") ||
      url.startsWith("/vite-hmr") ||
      url.startsWith("/@react-refresh")
    )
  ) {
    return next();
  }

  if (
    url.includes(".env") ||
    url.startsWith("/.") ||
    url.includes("..") ||
    url.includes("node_modules")
  ) {
    return res.status(403).end("Forbidden");
  }

  next();
});


app.get("/health", (_req, res) => res.status(200).send("ok"));
app.head("/health", (_req, res) => res.status(200).end());

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  console.log(`[${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

async function bootstrap() {
registerRoutes(httpServer, app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  console.log("NODE_ENV:", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  await setupVite(httpServer, app);
}

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.

const port = Number(process.env.PORT);

if (!port) {
  throw new Error("PORT is not defined");
}



  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`PORT ENV: ${process.env.PORT} | USING: ${port}`);
    },
  );

}

bootstrap().catch((error) => {
  console.error("Bootstrap failure:", error);
  process.exit(1);
});

// build timestamp: Fri May  1 03:30:48 PM UTC 2026
