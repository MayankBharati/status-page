// Test script for the external status API
// Run with: node test-api.js

const BASE_URL = 'http://localhost:3000';
const ORG_SLUG = 'demo';

async function testAPI() {
  console.log('🧪 Testing External Status API...\n');

  // Test JSON format
  try {
    console.log('📄 Testing JSON format...');
    const jsonResponse = await fetch(`${BASE_URL}/api/external/status?org=${ORG_SLUG}&format=json`);
    const jsonData = await jsonResponse.json();
    console.log('✅ JSON Response:', JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.log('❌ JSON test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test XML format
  try {
    console.log('📄 Testing XML format...');
    const xmlResponse = await fetch(`${BASE_URL}/api/external/status?org=${ORG_SLUG}&format=xml`);
    const xmlData = await xmlResponse.text();
    console.log('✅ XML Response:');
    console.log(xmlData.substring(0, 500) + '...');
  } catch (error) {
    console.log('❌ XML test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Text format
  try {
    console.log('📄 Testing Text format...');
    const textResponse = await fetch(`${BASE_URL}/api/external/status?org=${ORG_SLUG}&format=txt`);
    const textData = await textResponse.text();
    console.log('✅ Text Response:');
    console.log(textData);
  } catch (error) {
    console.log('❌ Text test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test uptime API (requires authentication)
  try {
    console.log('📊 Testing Uptime API...');
    const uptimeResponse = await fetch(`${BASE_URL}/api/uptime?days=30`);
    if (uptimeResponse.status === 401) {
      console.log('ℹ️  Uptime API requires authentication (expected)');
    } else {
      const uptimeData = await uptimeResponse.json();
      console.log('✅ Uptime Response:', JSON.stringify(uptimeData, null, 2));
    }
  } catch (error) {
    console.log('❌ Uptime test failed:', error.message);
  }
}

// Run the tests
testAPI().catch(console.error); 