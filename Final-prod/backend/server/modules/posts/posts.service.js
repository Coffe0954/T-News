import Post from './post.model.js';

class PostService {
  async createPost(title, content, authorId) {
    const post = new Post({ title, content, author: authorId });
    return await post.save();
  }

  async getPosts(page = 1, limit = 10) {
    return await Post.find()
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async likePost(postId, userId) {
    const post = await Post.findById(postId);
    
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
      post.likesCount += 1;
    } else {
      post.likes.splice(likeIndex, 1);
      post.likesCount -= Math.max(0, post.likesCount - 1);
    }
    
    return await post.save();
  }
}

const postService = new PostService();
export default postService;