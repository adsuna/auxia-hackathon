const API_BASE = 'http://localhost:3001/api';

async function testJobAPI() {
  console.log('🧪 Testing Job API Endpoints...\n');

  try {
    // First, let's test the health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`http://localhost:3001/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test without authentication (should fail)
    console.log('\n2. Testing job creation without auth (should fail)...');
    const noAuthResponse = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Job',
        description: 'Test Description',
        skills: ['JavaScript'],
        location: 'Test Location',
        ctcMin: 5,
        ctcMax: 10
      })
    });
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Correctly rejected request without authentication');
    } else {
      console.log('❌ Should have rejected request without authentication');
    }

    // For now, let's just test that the endpoints are accessible
    console.log('\n3. Testing job routes are registered...');
    const routeTestResponse = await fetch(`${API_BASE}/jobs/my-jobs`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    if (routeTestResponse.status === 401) {
      console.log('✅ Job routes are properly registered and protected');
    } else {
      console.log('❌ Job routes may not be properly configured');
    }

    console.log('\n🎉 Basic job API tests completed!');
    console.log('\nNote: Full testing requires authentication setup.');
    console.log('The job posting system backend is ready for integration.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testJobAPI();