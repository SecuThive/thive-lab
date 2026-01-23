#!/usr/bin/env node

/**
 * Test script for ThiveLab API
 * Run with: node test-api.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testEndpoint(name, url, expectedStatus = 200) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status} ${response.status === expectedStatus ? '✅' : '❌'}`);
    console.log(`   Rate Limit: ${response.headers.get('X-RateLimit-Remaining')}/${response.headers.get('X-RateLimit-Limit')}`);
    
    if (response.ok) {
      console.log(`   Data: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      console.log(`   Error: ${data.error || data.message}`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 ThiveLab API Test Suite\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(50));
  
  const results = [];
  
  // Test 1: Basic Steam Deals API
  results.push(await testEndpoint(
    'Steam Deals - Basic',
    `${BASE_URL}/api/v1/steam/deals?limit=5`
  ));
  
  // Test 2: Steam Deals with filters
  results.push(await testEndpoint(
    'Steam Deals - With Filters',
    `${BASE_URL}/api/v1/steam/deals?limit=10&min_discount=50&steam_deck=true`
  ));
  
  // Test 3: Steam Deals - Large limit
  results.push(await testEndpoint(
    'Steam Deals - Large Limit',
    `${BASE_URL}/api/v1/steam/deals?limit=100`
  ));
  
  // Test 4: Rate Limiting (make multiple requests)
  console.log(`\n🧪 Testing: Rate Limiting (11 requests)`);
  console.log(`   URL: ${BASE_URL}/api/v1/steam/deals`);
  let rateLimited = false;
  
  for (let i = 1; i <= 11; i++) {
    const response = await fetch(`${BASE_URL}/api/v1/steam/deals?limit=1`);
    if (response.status === 429) {
      console.log(`   Request ${i}: 429 Rate Limited ✅`);
      rateLimited = true;
      break;
    } else {
      console.log(`   Request ${i}: ${response.status} (${response.headers.get('X-RateLimit-Remaining')} remaining)`);
    }
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  results.push(rateLimited);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\nPassed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed. Check the output above.');
  }
  
  console.log('\n💡 Tips:');
  console.log('   - Make sure your dev server is running (npm run dev)');
  console.log('   - Ensure Upstash credentials are set in .env.local');
  console.log('   - Verify steam_deals table exists in Supabase');
  console.log('   - Wait 10 seconds after rate limit before testing again\n');
}

// Run tests
runTests().catch(console.error);
