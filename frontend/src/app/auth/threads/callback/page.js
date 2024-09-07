'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function ThreadsCallbackPage() {
  const [isOauthProcessing, setIsOauthProcessing] = useState(true);
  const [oauthSuccess, setOauthSuccess] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedState = sessionStorage.getItem('oauth_state');

    const stateFromCallback = searchParams.get('state');

    console.log('storedState', storedState);
    console.log('stateFromCallback', stateFromCallback);

    if (stateFromCallback !== storedState) {
      // 에러 처리 로직
      setIsOauthProcessing(false);
    } else {
      // 정상적인 인증 처리 로직

      const code = searchParams.get('code');

      const processOauth = async () => {
        console.log('backend url', process.env.NEXT_PUBLIC_BACKEND_URL);
        console.log('backend url2', process.env.BACKEND_URL);
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/threads/callback?code=${code}`);

          if (response.status === 200) {
            setOauthSuccess(true);
            console.log('response.data', response.data);
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
    return <p>oauth processing...</p>;
  }

  if (!oauthSuccess) {
    return (
      <div>
        <p>oauth state is not valid</p>
        <Link href="/">home</Link>
      </div>
    );
  }

  return (
    <div>
      <p>oauth success</p>
      <Link href="/">home</Link>
    </div>
  );
}
