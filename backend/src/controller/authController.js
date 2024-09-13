import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const socialProvider = 'THREADS';

export const threadsCallback = async (req, res) => {
  if (req.user) {
    try {
      const { user } = req;

      // 사용자 정보 저장 또는 업데이트
      const savedUser = await prisma.user.upsert({
        where: { username: user.username },
        update: {
          name: user.name,
          profilePicture: user.threads_profile_picture_url,
          biography: user.threads_biography,
        },
        create: {
          username: user.username,
          name: user.name,
          profilePicture: user.threads_profile_picture_url,
          biography: user.threads_biography,
        },
      });

      // 소셜 계정 정보 저장 또는 업데이트
      await prisma.socialAccount.upsert({
        where: {
          userId_provider: {
            userId: savedUser.id,
            provider: socialProvider,
          },
        },
        update: {
          providerId: user.id,
          // accessToken과 refreshToken이 있다면 여기에 추가
        },
        create: {
          userId: savedUser.id,
          provider: socialProvider,
          providerId: user.id,
          // accessToken과 refreshToken이 있다면 여기에 추가
        },
      });

      const generatedToken = jwt.sign({ userId: savedUser.id }, authConfig.jwt.secret, { expiresIn: '1h' });

      // 인증 정보 저장 또는 업데이트
      await prisma.auth.upsert({
        where: { userId: savedUser.id },
        update: {
          token: generatedToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1시간 후
        },
        create: {
          userId: savedUser.id,
          token: generatedToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1시간 후
        },
      });

      // 세션에 사용자 정보 저장
      req.session.user = savedUser;

      const clientUser = {
        username: savedUser.username,
        name: savedUser.name,
        profilePicture: savedUser.profilePicture,
        biography: savedUser.biography,
        provider: socialProvider,
      };

      // 토큰과 함께 사용자 정보도 전송
      res.json({ generatedToken, user: clientUser });
    } catch (error) {
      console.error('Threads 콜백 처리 중 오류 발생:', error);
      res.status(500).json({ error: 'Threads 인증 처리 중 오류가 발생했습니다.' });
    }
  } else {
    res.status(401).json({ error: '인증되지 않은 사용자입니다.' });
  }
};
