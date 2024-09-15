import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log('error 발생', err.message);
        req.isLoggedIn = false;
        res.status(401).json({ error: '인증이 필요합니다.' });
      }

      req.user = user;
      req.isLoggedIn = true;
      return next();
    });
  } else {
    req.isLoggedIn = false;
    res.status(401).json({ error: '인증이 필요합니다.' });
  }
};
