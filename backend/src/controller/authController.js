import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const socialProvider = 'THREADS';

export const threadsCallback = async (req, res) => {
  if (req.user) {
    try {
      const { user } = req;

      const generatedToken = jwt.sign({ userId: user.id, provider: user.socialProvider }, authConfig.jwt.secret, {
        expiresIn: '1h',
      });

      // 인증 정보 저장 또는 업데이트
      await prisma.auth.upsert({
        where: { userId: user.id },
        update: {
          token: generatedToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1시간 후
        },
        create: {
          userId: user.id,
          token: generatedToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1시간 후
        },
      });

      const clientUser = {
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
        biography: user.biography,
        provider: socialProvider,
      };

      res.json({ generatedToken, user: clientUser });
    } catch (error) {
      console.error('Threads 콜백 처리 중 오류 발생:', error);
      res.status(500).json({ error: 'Threads 인증 처리 중 오류가 발생했습니다.' });
    }
  } else {
    res.status(401).json({ error: '인증되지 않은 사용자입니다.' });
  }
};
