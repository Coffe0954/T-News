import User from "./user.model.js";
import jwt from "jsonwebtoken";

class AuthService {
  async register(username, password) {
    console.log("Register attempt:", username);
    const exists = await User.findOne({ username });
    if (exists) {
      console.log("Username already exists");
      throw new Error("Username already exists");
    }

    const user = new User({ username, password });
    await user.save();
    console.log("User created:", user._id);

    return this.generateToken(user);
  }

  async login(username, password) {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Invalid credentials");
    }

    return this.generateToken(user);
  }

  generateToken(user) {
    return {
      token: jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      ),
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
    };
  }
}

const authService = new AuthService();
export default authService;
