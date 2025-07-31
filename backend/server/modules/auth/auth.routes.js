export default async function (fastify) {
  const controller = (await import('./auth.controller.js')).default;
  
  fastify.post('/register', 
    {
      schema: {
        body: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', minLength: 3 },
            password: { type: 'string', minLength: 6 }
          }
        }
      }
    },
    controller.register
  );

  fastify.post('/login', 
    {
      schema: {
        body: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' }
          }
        }
      }
    },
    controller.login
  );
}