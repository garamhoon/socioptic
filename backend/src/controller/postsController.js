import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export const getThreadsPosts = async (req, res) => {
  try {
    const { id: userId, socialProvider } = req.user;

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

    // Threads API 호출
    const response = await axios.get(`${process.env.THREADS_GRAPH_URL}/${socialAccount.providerId}/threads`, {
      params: {
        fields: 'id,media_url,text,timestamp',
        access_token: socialAccount.accessToken,
        //since: '2024-08-15',
        //until: '2024-09-18',
      },
    });

    // const posts = response.data.items.map((item) => ({
    //   id: item.id,
    //   content: item.caption.text,
    //   createdAt: new Date(item.taken_at * 1000).toISOString(),
    //   // 필요한 다른 필드들 추가
    // }));

    const posts = response.data;

    res.json(posts);
  } catch (error) {
    console.error('포스트 조회 중 오류 발생:', error);
    res.status(500).json({ error: '포스트를 가져오는 중 오류가 발생했습니다.' });
  }
};
