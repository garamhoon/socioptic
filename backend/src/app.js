import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js'; // 추가
import cors from 'cors';
import './config/passport.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.APP_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // 개발 환경에서는 false로 설정
      // httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24시간
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes); // 추가

app.listen(port, () => {
  console.log(`Socioptic 백엔드가 포트 ${port}에서 실행 중입니다`);
});

// 애플리케이션 종료 시 Prisma 연결 닫기
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
