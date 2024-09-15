'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Post {
  externalId: string;
  content: string;
  createdAt: string;
  views: number;
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
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

        setPosts(response.data.posts);
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
          {posts.map((post, index, array) => (
            <li
              key={post.externalId}
              className="bg-white shadow rounded-lg p-4 transition-transform duration-300 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-800">포스트 #{array.length - index}</span>
                <p className="text-sm text-gray-500">작성일: {new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-gray-800">
                {post.content.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < post.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
              <div className="mt-2 flex space-x-4 text-sm text-gray-600">
                <span>조회수: {post.views.toLocaleString()}</span>
                <span>좋아요: {post.likes.toLocaleString()}</span>
                <span>댓글: {post.replies.toLocaleString()}</span>
                <span>리포스트: {post.reposts.toLocaleString()}</span>
                <span>인용: {post.quotes.toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
