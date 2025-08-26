// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:3001/api';

async function testProfileAPI() {
  console.log('🧪 Testing Profile Management API...\n');

  // Step 1: Request OTP
  console.log('1. Requesting OTP...');
  const otpResponse = await fetch(`${API_BASE}/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
  });
  
  const otpData = await otpResponse.json();
  console.log('OTP Response:', otpData.success ? '✅ Success' : '❌ Failed');

  // Step 2: Verify OTP (using a mock code since we can't get the real one)
  console.log('\n2. Verifying OTP (using test code 123456)...');
  const loginResponse = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', code: '123456' })
  });
  
  const loginData = await loginResponse.json();
  console.log('Login Response:', loginData.token ? '✅ Success' : '❌ Failed');
  
  if (!loginData.token) {
    console.log('❌ Cannot continue without token');
    return;
  }

  const token = loginData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Step 3: Set user role to STUDENT
  console.log('\n3. Setting user role to STUDENT...');
  const roleResponse = await fetch(`${API_BASE}/profile/role`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ role: 'STUDENT' })
  });
  
  const roleData = await roleResponse.json();
  console.log('Role Response:', roleData.success ? '✅ Success' : '❌ Failed');

  // Step 4: Create student profile
  console.log('\n4. Creating student profile...');
  const profileData = {
    name: 'John Doe',
    branch: 'Computer Science',
    year: 3,
    headline: 'Passionate software developer looking for internship opportunities',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    projectUrl: 'https://github.com/johndoe/awesome-project',
    resumeUrl: 'https://drive.google.com/file/d/resume',
    videoUrl: 'https://youtube.com/watch?v=intro'
  };

  const createProfileResponse = await fetch(`${API_BASE}/profile/student`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(profileData)
  });
  
  const createProfileData = await createProfileResponse.json();
  console.log('Create Profile Response:', createProfileData.success ? '✅ Success' : '❌ Failed');
  
  if (createProfileData.success) {
    console.log('Profile created with ID:', createProfileData.data.id);
  }

  // Step 5: Update student profile
  console.log('\n5. Updating student profile...');
  const updatedProfileData = {
    ...profileData,
    headline: 'Updated: Experienced software developer seeking full-time opportunities',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'TypeScript']
  };

  const updateProfileResponse = await fetch(`${API_BASE}/profile/student`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(updatedProfileData)
  });
  
  const updateProfileData = await updateProfileResponse.json();
  console.log('Update Profile Response:', updateProfileData.success ? '✅ Success' : '❌ Failed');

  // Step 6: Get current user with profile
  console.log('\n6. Getting current user with profile...');
  const userResponse = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: authHeaders
  });
  
  const userData = await userResponse.json();
  console.log('User Response:', userData.user ? '✅ Success' : '❌ Failed');
  console.log('Profile Complete:', userData.profileComplete ? '✅ Yes' : '❌ No');

  console.log('\n🎉 Profile Management API Test Complete!');
}

// Run the test
testProfileAPI().catch(console.error);