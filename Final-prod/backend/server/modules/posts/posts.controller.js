export const postController = {
  createPost: async (req, reply) => {
    try {
      const post = await postService.createPost(req.body, req.user);
      reply.code(201).send(post);
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  },

  getPosts: async (req, reply) => {
    const posts = await postService.getPosts();
    reply.send(posts);
  }
};