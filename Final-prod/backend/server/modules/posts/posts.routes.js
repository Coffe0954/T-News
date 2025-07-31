import { postController } from './posts.controller.js';

async function postsRoutes(fastify) {
  // Правильная регистрация с preValidation
  fastify.post('/', { 
    preValidation: [fastify.authenticate], // Убедитесь что authenticate зарегистрирован
    handler: postController.createPost
  });

  fastify.get('/', postController.getPosts);
}

export default postsRoutes;