// Simple script to check database session - run via: vercel env pull && node scripts/check-session.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSession() {
  const shopDomain = 'galactiva.myshopify.com';

  console.log('🔍 Debugging shop session:', shopDomain);
  console.log('═'.repeat(70));

  try {
    // 1. Check for exact match
    const session = await prisma.session.findFirst({
      where: { shop: shopDomain }
    });

    if (session) {
      console.log('✅ SESSION FOUND:');
      console.log('   Shop:', session.shop);
      console.log('   ID:', session.id);
      console.log('   Online Mode:', session.isOnline);
      console.log('   Expires:', session.expires);
      console.log('   Has Access Token:', !!session.accessToken);
      console.log('   Token Length:', session.accessToken?.length || 0);
      console.log('   Scope:', session.scope);

      if (session.expires && new Date(session.expires) < new Date()) {
        console.log('   🚨 STATUS: EXPIRED');
      } else if (!session.accessToken) {
        console.log('   🚨 STATUS: MISSING ACCESS TOKEN');
      } else {
        console.log('   ✅ STATUS: VALID');
      }
    } else {
      console.log('❌ NO SESSION FOUND for', shopDomain);
    }

    console.log('\n📊 ALL SESSIONS IN DATABASE:');
    const allSessions = await prisma.session.findMany({
      select: {
        id: true,
        shop: true,
        isOnline: true,
        expires: true,
        accessToken: true
      }
    });

    if (allSessions.length === 0) {
      console.log('   ⚠️  No sessions exist in database!');
      console.log('   💡 Action needed: Install the app on the shop to create a session');
    } else {
      console.log(`   Found ${allSessions.length} session(s):\n`);
      allSessions.forEach((s, i) => {
        console.log(`   ${i + 1}. Shop: ${s.shop}`);
        console.log(`      Online: ${s.isOnline}`);
        console.log(`      Expires: ${s.expires}`);
        console.log(`      Has Token: ${!!s.accessToken}`);
        console.log('');
      });
    }

    console.log('═'.repeat(70));
    console.log('\n📝 DIAGNOSIS:');

    if (!session) {
      console.log('   The shop "galactiva.myshopify.com" has no session in the database.');
      console.log('   This happens when:');
      console.log('   1. The app was never installed on this shop');
      console.log('   2. The app was uninstalled');
      console.log('   3. The session was manually deleted from the database');
      console.log('\n   ✅ SOLUTION:');
      console.log('   Re-install the app on the shop to create a new session with offline access token');
    } else if (!session.accessToken) {
      console.log('   Session exists but has NO ACCESS TOKEN');
      console.log('   ✅ SOLUTION:');
      console.log('   Re-install the app to generate a new access token');
    } else if (session.expires && new Date(session.expires) < new Date()) {
      console.log('   Session exists but is EXPIRED');
      console.log('   ✅ SOLUTION:');
      console.log('   Re-install the app to refresh the session');
    }

  } catch (error) {
    console.error('\n❌ DATABASE ERROR:', error.message);
    console.log('\n💡 Check that DATABASE_URL is set correctly in environment');
  } finally {
    await prisma.$disconnect();
  }
}

checkSession();
