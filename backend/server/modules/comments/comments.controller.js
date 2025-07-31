import commentService from './comments.service.js';

async function createComment(req, reply) {
  try {
    const comment = await commentService.createComment(
      req.body.content,
      req.user.userId,
      req.params.postId
    );
    reply.code(201).send(comment);
  } catch (error) {
    reply.code(400).send({ message: error.message });
  }
}

async function getComments(req, reply) {
  const comments = await commentService.getCommentsByPost(req.params.postId);
  reply.send(comments);
}

export default { createComment, getComments };