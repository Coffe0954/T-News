import dotenv from "dotenv";
dotenv.config({ path: "./backend/server/.env" });
import fastify from "fastify";
import mongoose from "mongoose";
import { loadPlugins } from "../plugin-loader.js";
import fastifyMultipart from "@fastify/multipart";
import { join, dirname } from "path";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function buildApp() {
  const app = fastify({
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "HH:MM:ss Z",
        },
      },
    },
  });

  // Проверка обязательных переменных окружения
  const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "PORT"];
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    app.log.error(
      `❌ Missing required environment variables: ${missingVars.join(", ")}`
    );
    process.exit(1);
  }

  const PORT = parseInt(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  // Подключение к MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    app.log.info(`✅ MongoDB connected to ${process.env.MONGO_URI}`);
    app.decorate("mongoose", mongoose);
  } catch (err) {
    app.log.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }

  // Создание необходимых директорий
  const staticDirs = {
    client: join(process.cwd(), "client"),
    uploads: join(process.cwd(), "uploads"),
  };

  Object.entries(staticDirs).forEach(([name, path]) => {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      app.log.info(`📁 Created directory: ${path}`);
    }
  });

  // Регистрация плагинов
  try {
    await loadPlugins(app);
    await app.register(fastifyMultipart, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    });
  } catch (err) {
    app.log.error("❌ Plugin registration error:", err);
    process.exit(1);
  }

  // Статические файлы
  await app.register(import("@fastify/static"), {
    root: join(process.cwd(), "client"),
    prefix: "/",
    decorateReply: false,
    extensions: ["html", "css", "js", "svg", "woff2"],
    index: ["index.html"],
    redirect: true,
  });

  await app.register(import("@fastify/static"), {
    root: join(process.cwd(), "uploads"),
    prefix: "/uploads/",
    decorateReply: false,
  });

  // Перенаправление с корня
  app.get("/", async (req, reply) => {
    return reply.sendFile("index.html");
  });

  // Загрузка маршрутов API
  await loadRoutes(app);

  // Health check
  app.get("/api/health", async (req, reply) => {
    reply.send({
      status: "ok",
      mongo: mongoose.connection.readyState === 1,
      uptime: process.uptime(),
    });
  });

  // Обработка закрытия приложения
  process.on("SIGINT", async () => {
    await app.close();
    process.exit(0);
  });

  return app;
}

async function loadRoutes(app) {
  const routes = [
    { path: "../server/modules/auth/auth.routes.js", prefix: "/api/auth" },
    { path: "../server/modules/posts/posts.routes.js", prefix: "/api/posts" },
    {
      path: "../server/modules/comments/comments.routes.js",
      prefix: "/api/comments",
    },
    { path: "../server/modules/users/users.routes.js", prefix: "/api/users" },
  ];

  for (const route of routes) {
    try {
      const routePath = new URL(route.path, import.meta.url).pathname;
      const routeModule = await import(routePath);
      await app.register(routeModule.default, { prefix: route.prefix });
      app.log.info(`🟢 Route ${route.prefix} registered`);
    } catch (err) {
      app.log.error(`🔴 Failed to load route ${route.path}:`, err);
      throw err;
    }
  }
}