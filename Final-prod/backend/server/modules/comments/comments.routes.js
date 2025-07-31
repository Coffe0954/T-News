export default async function (fastify) {
  const controller = (await import('./comments.controller.js')).default;
  
  fastify.post('/:postId', { 
    preValidation: [fastify.authenticate],
    handler: controller.createComment
  });

  fastify.get('/:postId', controller.getComments);
}