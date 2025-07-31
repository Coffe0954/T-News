import Comment from './comment.model.js';
import Post from '../posts/post.model.js';

class CommentService {
  async createComment(content, authorId, postId) {
    const comment = new Comment({ content, author: authorId, post: postId });
    await comment.save();
    
    // Add comment to post
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });
    
    return comment;
  }

  async getCommentsByPost(postId) {
    return await Comment.find({ post: postId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
  }
}

const commentService = new CommentService();
export default commentService;