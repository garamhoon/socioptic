# 폴더 구조

```plain text
backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── passport.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   │
│   ├── models/
│   │   └── User.js  // Prisma client를 사용하므로 이 파일은 선택적
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   └── userService.js
│   │
│   ├── middlewares/
│   │   └── errorHandler.js
│   │
│   ├── utils/
│   │   └── logger.js
│   │
│   └── app.js
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── .gitignore
└── package.json
```
