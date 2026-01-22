import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRatings() {
  try {
    const ratedSessions = await prisma.chatSession.findMany({
      where: {
        rating: { not: null },
      },
      select: {
        id: true,
        shop: true,
        rating: true,
        ratingComment: true,
        ratedAt: true,
        createdAt: true,
      },
      orderBy: { ratedAt: 'desc' },
    });

    console.log('\n=== ALL RATED SESSIONS ===');
    console.log('Total rated sessions:', ratedSessions.length);
    console.log(JSON.stringify(ratedSessions, null, 2));

    const byShop = ratedSessions.reduce((acc: any, session: any) => {
      if (!acc[session.shop]) acc[session.shop] = [];
      acc[session.shop].push(session);
      return acc;
    }, {});

    console.log('\n=== RATINGS BY SHOP ===');
    for (const [shop, sessions] of Object.entries(byShop)) {
      const sessionsArray = sessions as any[];
      const avg = sessionsArray.reduce((sum, s) => sum + (s.rating || 0), 0) / sessionsArray.length;
      console.log('\nShop:', shop);
      console.log('Count:', sessionsArray.length);
      console.log('Average:', avg.toFixed(1));
      console.log('Ratings:', sessionsArray.map(s => s.rating));
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkRatings();
