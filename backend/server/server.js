import { buildApp } from './app.js';

const startServer = async () => {
  try {
    const app = await buildApp();
    const PORT = parseInt(process.env.PORT) || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    // Graceful shutdown
    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, async () => {
        await app.close();
        console.log('\n🛑 Server gracefully stopped');
        process.exit(0);
      });
    });

    await app.listen({ port: PORT, host: HOST });

    console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════');
    console.log('\x1b[32m%s\x1b[0m', '🌐 Server running at:');
    console.log(`\x1b[4m\x1b[34mhttp://localhost:${PORT}/pages/index.html\x1b[0m (main)`);
    console.log(`\x1b[4m\x1b[34mhttp://localhost:${PORT}/pages/login.html\x1b[0m (login)`);
    console.log(`\x1b[4m\x1b[34mhttp://localhost:${PORT}/pages/signup.html\x1b[0m (signup)`);
    console.log('\x1b[36m%s\x1b[0m', '══════════════════════════════════════════════════');
    
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Server startup error:', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('\x1b[31m%s\x1b[0m', '⚠️ Unhandled Rejection:', err);
  process.exit(1);
});

startServer();