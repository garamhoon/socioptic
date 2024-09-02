import passport from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import axios from 'axios';

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

      console.log('tokenResponse', tokenResponse.data);

      const { access_token, user_id } = tokenResponse.data;

      const userId = `threads_${user_id}`;

      // 액세스 토큰으로 사용자 정보 요청
      const userResponse = await axios.get(
        `${threadsGraphUrl}/v1.0/me?fields=id,username,name,threads_profile_picture_url,threads_biography&access_token=${access_token}`
      );

      const profile = userResponse.data;

      // 여기에서 사용자 정보를 데이터베이스에 저장하거나 조회하는 로직을 구현합니다.
      // 예: const user = await User.findOrCreate({ threadsId: profile.id });

      const user = {
        id: userId,
        test: true,
        ...profile,
      };

      done(null, user);
    } catch (error) {
      console.error('error', error.config.url, error.response?.data);
      done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((sessionUser, done) => {
  done(null, sessionUser);
});
