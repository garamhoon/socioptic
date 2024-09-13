'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function ThreadsCallbackPage() {
  const [isOauthProcessing, setIsOauthProcessing] = useState(true);
  const [oauthError, setOauthError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const storedState = sessionStorage.getItem('oauth_state');
    const stateFromCallback = searchParams.get('state');

    if (stateFromCallback !== storedState) {
      setIsOauthProcessing(false);
      setOauthError('OAuth state is not valid');
    } else {
      const code = searchParams.get('code');

      const processOauth = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/threads/callback?code=${code}`);

          if (response.status === 200) {
            const { generatedToken, user } = response.data;

            // 토큰과 사용자 정보를 로컬 스토리지에 저장
            localStorage.setItem('authToken', generatedToken);
            localStorage.setItem('user', JSON.stringify(user));

            // 로그인 성공 후 메인 페이지로 리다이렉트
            router.push('/');
          } else {
            setOauthError(response.data.error);
          }
        } catch (error) {
          console.error(error);
          setOauthError(error.message);
        } finally {
          setIsOauthProcessing(false);
        }
      };

      processOauth();
    }
  }, []);

  if (isOauthProcessing) {
    return <p>인증 처리 중...</p>;
  }

  if (oauthError) {
    return <p>인증 오류: {oauthError}</p>;
  }

  return null; // 로그인 성공 시 메인 페이지로 리다이렉트되므로 이 부분은 실행되지 않습니다.
}
