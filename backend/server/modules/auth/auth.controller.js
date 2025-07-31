import authService from './auth.service.js';

async function register(req, reply) {
  try {
    const { token, user } = await authService.register(
      req.body.username, 
      req.body.password
    );
    
    // Убрали setCookie, используем только JSON-ответ
    reply.code(201).send({ 
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    reply.code(400).send({ 
      success: false,
      error: error.message 
    });
  }
}

async function login(req, reply) {
  try {
    const { token, user } = await authService.login(
      req.body.username, 
      req.body.password
    );
    
    // Убрали setCookie
    reply.send({ 
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    reply.code(401).send({ 
      success: false,
      error: error.message 
    });
  }
}

export default { register, login };