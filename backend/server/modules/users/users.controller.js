import fs from 'fs';
import path from 'path';

export default {
  uploadAvatar: async (req, reply) => {
    const file = await req.file();
    const userId = req.user.userId;
    
    if (!file || !file.mimetype.startsWith('image/')) {
      return reply.code(400).send({ error: 'Invalid file type' });
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filename = `avatar-${userId}-${Date.now()}${path.extname(file.filename)}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, await file.toBuffer());
    
    // Обновляем аватар в БД
    await User.findByIdAndUpdate(userId, { avatar: `/uploads/${filename}` });
    
    reply.send({ avatarUrl: `/uploads/${filename}` });
  }
};