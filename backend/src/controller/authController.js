import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';

export const threadsCallback = (req, res) => {
  if (req.user) {
    try {
      const { user } = req;

      // 세션에 사용자 정보 저장
      req.session.user = user;

      const generatedToken = jwt.sign(user, authConfig.jwt.secret, { expiresIn: '1h' });

      // 토큰과 함께 사용자 정보도 전송
      res.json({ generatedToken, user });
    } catch (error) {
      console.error('Threads 콜백 처리 중 오류 발생:', error);
      res.status(500).json({ error: 'Threads 인증 처리 중 오류가 발생했습니다.' });
    }
  } else {
    res.status(401).json({ error: '인증되지 않은 사용자입니다.' });
  }
};
