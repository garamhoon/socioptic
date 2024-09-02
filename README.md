# Socioptic

Socioptic은 소셜 미디어 관리 및 분석을 위한 종합 플랫폼입니다.

## 목표

- nodejs, expressjs, nextjs에 익숙해지기

## 기능

- 소셜 미디어 계정 연동 및 관리
- 게시물 일정 관리 및 자동 게시
- 소셜 미디어 통계 리포트
- AI를 활용한 게시물 성과 예측 및 분석

## 프로젝트 구조

- `frontend/`: Next.js 기반의 프론트엔드 웹 애플리케이션
- `backend/`: Express.js 기반의 백엔드 API 서버

## 시작하기

### 설치

1. 저장소를 클론합니다:

   ```
   git clone https://github.com/garamhoon/socioptic.git
   cd socioptic
   ```

2. 모든 의존성을 설치합니다:

   ```
   npm run install:all
   ```

3. frontend app을 https로 실행시키기 위하여 ssl 키를 생성하세요:

   ```
   mkdir frontend/keys && cd frontend/keys
   openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365
   ```

### 실행

프로젝트를 실행하려면:

1. 다음 명령어를 실행하세요:

   ```
   npm run dev
   ```

   이 명령어는 백엔드와 프론트엔드를 동시에 실행합니다.

2. 브라우저에서 `https://localhost:8081`으로 접속하여 프론트엔드를 확인할 수 있습니다.
3. 백엔드 API는 `http://localhost:8080`에서 실행됩니다.

## 기술 스택

- 프론트엔드: React.js
- 백엔드: Express.js
- 데이터베이스
  - PostreSQL
  - Redis

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 연락처

프로젝트 관리자 - [@garamhoon](https://www.threads.net/@garamhoon) - garamhoon@gmail.com
