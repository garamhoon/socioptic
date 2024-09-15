import passport from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const socialProvider = 'THREADS';

passport.use(
  'threads',
  new CustomStrategy(async (req, done) => {
    try {
      const threadsGraphUrl = 'https://graph.threads.net';

      const { code } = req.query;

      const tokenResponse = await axios.post(`${threadsGraphUrl}/oauth/access_token`, {
        client_id: process.env.THREADS_CLIENT_ID,
        client_secret: process.env.THREADS_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.FRONTEND_URL}/auth/threads/callback`,
      });

      const { access_token } = tokenResponse.data;

      // 액세스 토큰으로 사용자 정보 요청
      const userResponse = await axios.get(
        `${threadsGraphUrl}/v1.0/me?fields=id,username,name,threads_profile_picture_url,threads_biography&access_token=${access_token}`
      );

      const profile = userResponse.data;

      const providerId = profile.id.toString();

      // 사용자 정보 저장 또는 업데이트
      const savedUser = await prisma.user.upsert({
        where: { username: profile.username },
        update: {
          name: profile.name,
          profilePicture: profile.threads_profile_picture_url,
          biography: profile.threads_biography,
        },
        create: {
          username: profile.username,
          name: profile.name,
          profilePicture: profile.threads_profile_picture_url,
          biography: profile.threads_biography,
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
          providerId: providerId,
          accessToken: access_token,
          // refreshToken이 있다면 여기에 추가
        },
        create: {
          userId: savedUser.id,
          provider: socialProvider,
          providerId: providerId,
          accessToken: access_token,
          // refreshToken이 있다면 여기에 추가
        },
      });

      savedUser.socialProvider = socialProvider;

      done(null, savedUser);
    } catch (error) {
      console.error('error', error.config.url, error.response?.data);
      done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    console.log('Deserialized user:', user);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
