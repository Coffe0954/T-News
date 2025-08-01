import { join } from "path";

export async function loadPlugins(app) {
  await app.register(import("@fastify/helmet"));
  
  await app.register(import("@fastify/cors"), {
    origin: JSON.parse(process.env.CORS_ORIGINS || '["http://localhost:8080"]'),
    credentials: true,
  });

  // JWT аутентификация
  await app.register(import("@fastify/jwt"), {
    secret: process.env.JWT_SECRET,
  });

  app.decorate("authenticate", async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: "Authentication required" });
    }
  });
}
