'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Post {
  id: string;
  text: string;
  timestamp: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/threads`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setPosts(response.data.data);
      } catch (err) {
        setError('포스트를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">내 포스트</h1>
      {posts.length === 0 ? (
        <p>포스트가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {posts
            .filter((post) => post.text)
            .map((post) => (
              <li key={post.id} className="bg-white shadow rounded-lg p-4">
                <p className="text-gray-800">
                  {post.text.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < post.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                <p className="text-sm text-gray-500 mt-2">작성일: {new Date(post.timestamp).toLocaleString()}</p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
