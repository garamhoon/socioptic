import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';

export const threadsCallback = (req, res) => {
  if (req.user) {
    try {
      // req.user 객체를 JSON 형태로 응답
      const { user } = req;

      console.log('authConfig', authConfig);
      const generatedToken = jwt.sign(user, authConfig.jwt.secret, { expiresIn: '1h' });

      res.json({ generatedToken });
    } catch (error) {
      console.error('Threads 콜백 처리 중 오류 발생:', error);
      res.status(500).json({ error: 'Threads 인증 처리 중 오류가 발생했습니다.' });
    }
  } else {
    res.status(401).json({ error: '이미 인증된 사용자입니다.' });
  }
};
