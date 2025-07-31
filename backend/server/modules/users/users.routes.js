export default async function (fastify) {
  const controller = (await import('./users.controller.js')).default;
  
  fastify.post('/avatar', { 
    preValidation: [fastify.authenticate],
    handler: controller.uploadAvatar
  });
}