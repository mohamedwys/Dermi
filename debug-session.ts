// Debug script to check session in database
import { prisma } from './app/db.server.ts';

async function debugSession() {
  const shopDomain = 'galactiva.myshopify.com';

  console.log('🔍 Checking database for shop:', shopDomain);
  console.log('═'.repeat(60));

  try {
    // Check if session exists
    const session = await prisma.session.findFirst({
      where: { shop: shopDomain }
    });

    if (!session) {
      console.log('❌ NO SESSION FOUND in database for', shopDomain);
      console.log('\n📋 All sessions in database:');
      const allSessions = await prisma.session.findMany({
        select: {
          shop: true,
          id: true,
          isOnline: true,
          expires: true,
          state: true,
          scope: true
        }
      });

      if (allSessions.length === 0) {
        console.log('⚠️  Database has NO sessions at all!');
      } else {
        console.table(allSessions);
      }
    } else {
      console.log('✅ Session found:');
      console.log('   ID:', session.id);
      console.log('   Shop:', session.shop);
      console.log('   Online:', session.isOnline);
      console.log('   State:', session.state);
      console.log('   Scope:', session.scope);
      console.log('   Expires:', session.expires);
      console.log('   AccessToken:', session.accessToken ? '✅ Present' : '❌ Missing');
      console.log('   AccessToken length:', session.accessToken?.length || 0);

      if (session.expires && new Date(session.expires) < new Date()) {
        console.log('   ⚠️  SESSION EXPIRED on', session.expires);
      }
    }

    console.log('\n═'.repeat(60));
  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSession().catch(console.error);
