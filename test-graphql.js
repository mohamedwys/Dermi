// Test GraphQL query directly
// Run: node test-graphql.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGraphQL() {
  const shopDomain = 'galactiva.myshopify.com';

  console.log('Testing GraphQL query for shop:', shopDomain);
  console.log('═'.repeat(70));

  // Get session
  const session = await prisma.session.findFirst({
    where: { shop: shopDomain }
  });

  if (!session) {
    console.log('❌ No session found');
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Session found, testing GraphQL queries...\n');

  // Test 1: Simple query without sorting
  console.log('TEST 1: Simple query (status:active, no sorting)');
  console.log('-'.repeat(70));
  try {
    const response1 = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': session.accessToken
      },
      body: JSON.stringify({
        query: `
          query {
            products(first: 5, query: "status:active") {
              edges {
                node {
                  id
                  title
                  createdAt
                }
              }
            }
          }
        `
      })
    });

    const data1 = await response1.json();

    if (data1.errors) {
      console.log('❌ GraphQL Errors:', JSON.stringify(data1.errors, null, 2));
    } else {
      console.log('✅ Success! Found', data1?.data?.products?.edges?.length || 0, 'products');
      data1?.data?.products?.edges?.forEach((edge, i) => {
        console.log(`   ${i + 1}. ${edge.node.title} (${edge.node.createdAt})`);
      });
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 2: Query with static sorting (like current code)
  console.log('TEST 2: With sortKey: CREATED_AT, reverse: true (CURRENT CODE)');
  console.log('-'.repeat(70));
  try {
    const response2 = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': session.accessToken
      },
      body: JSON.stringify({
        query: `
          query {
            products(first: 5, query: "status:active", sortKey: CREATED_AT, reverse: true) {
              edges {
                node {
                  id
                  title
                  createdAt
                }
              }
            }
          }
        `
      })
    });

    const data2 = await response2.json();

    if (data2.errors) {
      console.log('❌ GraphQL Errors:', JSON.stringify(data2.errors, null, 2));
    } else {
      console.log('✅ Success! Found', data2?.data?.products?.edges?.length || 0, 'products');
      data2?.data?.products?.edges?.forEach((edge, i) => {
        console.log(`   ${i + 1}. ${edge.node.title} (${edge.node.createdAt})`);
      });
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n');

  // Test 3: Bestseller query
  console.log('TEST 3: Bestseller query (tag:bestseller)');
  console.log('-'.repeat(70));
  try {
    const response3 = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': session.accessToken
      },
      body: JSON.stringify({
        query: `
          query {
            products(first: 5, query: "tag:bestseller", sortKey: CREATED_AT, reverse: true) {
              edges {
                node {
                  id
                  title
                  tags
                }
              }
            }
          }
        `
      })
    });

    const data3 = await response3.json();

    if (data3.errors) {
      console.log('❌ GraphQL Errors:', JSON.stringify(data3.errors, null, 2));
    } else {
      const count = data3?.data?.products?.edges?.length || 0;
      console.log('✅ Success! Found', count, 'products with tag:bestseller');
      if (count === 0) {
        console.log('   ⚠️  No products have "bestseller" tag - need to add it in Shopify admin');
      } else {
        data3?.data?.products?.edges?.forEach((edge, i) => {
          console.log(`   ${i + 1}. ${edge.node.title}`);
          console.log(`      Tags: ${edge.node.tags.join(', ')}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n═'.repeat(70));
  await prisma.$disconnect();
}

testGraphQL().catch(console.error);
