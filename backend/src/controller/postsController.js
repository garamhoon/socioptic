import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export const getThreadsPosts = async (req, res) => {
  try {
    const { userId, socialProvider } = req.user;

    // 사용자의 Threads 소셜 계정 정보 조회
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: userId,
        provider: socialProvider,
      },
    });

    if (!socialAccount) {
      return res.status(404).json({ error: 'Threads 계정이 연동되어 있지 않습니다.' });
    }

    // DB에서 사용자의 모든 포스트 조회
    const dbPosts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // 마지막 포스트의 날짜 확인
    const lastPostDate = dbPosts.length > 0 ? dbPosts[0].createdAt : null;

    const params = {
      fields: 'id,media_url,text,timestamp',
      access_token: socialAccount.accessToken,
      since: lastPostDate ? lastPostDate.toLocaleDateString('en-CA') : undefined,
    };

    if (lastPostDate) {
      params.since = lastPostDate.toLocaleDateString('en-CA');
    }

    // Threads API 호출
    const response = await axios.get(`${process.env.THREADS_GRAPH_URL}/me/threads`, {
      params,
    });

    const newPosts = response.data.data;

    // 5분 이상 지난 포스트 필터링 및 DB 저장
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const postsToSave = newPosts.filter((post) => post.text && new Date(post.timestamp) < fiveMinutesAgo);

    const savedPosts = [];

    for (const post of postsToSave) {
      const savedPost = await prisma.post.upsert({
        where: { externalId: post.id },
        update: {
          content: post.text,
          mediaUrl: post.media_url,
          createdAt: new Date(post.timestamp),
        },
        create: {
          externalId: post.id,
          content: post.text,
          mediaUrl: post.media_url,
          createdAt: new Date(post.timestamp),
          userId,
        },
      });

      savedPosts.push(savedPost);
    }

    // DB의 포스트와 새로운 포스트 합치기
    let allPosts = [...savedPosts, ...dbPosts];

    // 인사이트 조회 및 DB 업데이트
    const updatePostPromises = allPosts.map(async (post) => {
      try {
        const response = await axios.get(`${process.env.THREADS_GRAPH_URL}/${post.externalId}/insights`, {
          params: {
            metric: 'views,likes,replies,reposts,quotes',
            access_token: socialAccount.accessToken,
          },
        });

        const { data: insights } = response.data;

        const updatedData = {
          views: 0,
          likes: 0,
          quotes: 0,
          replies: 0,
          reposts: 0,
        };

        for (const insight of insights) {
          if (insight.name === 'views' || insight.name === '조회') {
            updatedData.views = insight.values[0].value;
          } else if (insight.name === 'likes' || insight.name === '좋아요') {
            updatedData.likes = insight.values[0].value;
          } else if (insight.name === 'replies' || insight.name === '답글') {
            updatedData.replies = insight.values[0].value;
          } else if (insight.name === 'reposts' || insight.name === '리포스트') {
            updatedData.reposts = insight.values[0].value;
          } else if (insight.name === 'quotes' || insight.name === '인용') {
            updatedData.quotes = insight.values[0].value;
          }
        }

        await prisma.post.update({
          where: { id: post.id },
          data: updatedData,
        });

        return { ...post, ...updatedData };
      } catch (error) {
        console.error(`포스트 ${post.externalId} 업데이트 중 오류 발생:`, error.message);
        return post;
      }
    });

    allPosts = await Promise.all(updatePostPromises);

    const filteredAllPosts = allPosts
      .map(({ id, ...rest }) => rest)
      .filter((post, index, self) => index === self.findIndex((t) => t.externalId === post.externalId));

    res.json({ posts: filteredAllPosts });
  } catch (error) {
    console.error('포스트 조회 중 오류 발생:', error.message);
    res.status(500).json({ error: '포스트를 가져오는 중 오류가 발생했습니다.' });
  }
};
