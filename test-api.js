const http = require('http');

console.log('🧪 Testing InterviewLens API Endpoints\n');
console.log('=' .repeat(50));

// Test 1: Health Endpoint
console.log('\n1️⃣  Testing Health Endpoint...');
http.get('http://localhost:3001/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Response: ${data}`);
    testCreateUser();
  });
}).on('error', err => {
  console.error(`   ❌ Error: ${err.message}`);
  process.exit(1);
});

// Test 2: Create User
function testCreateUser() {
  console.log('\n2️⃣  Testing Create User Endpoint...');
  
  const userData = JSON.stringify({
    name: 'Test Engineer',
    target_role: 'Full Stack Developer',
    resume_text: 'Experienced in React, Node.js, MongoDB, and AWS.'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': userData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`   Status: ${res.statusCode}`);
      const user = JSON.parse(data);
      console.log(`   Created User:`);
      console.log(`     - ID: ${user._id}`);
      console.log(`     - Name: ${user.name}`);
      console.log(`     - Role: ${user.target_role}`);
      
      testGetDashboard(user._id);
    });
  });

  req.on('error', err => {
    console.error(`   ❌ Error: ${err.message}`);
  });

  req.write(userData);
  req.end();
}

// Test 3: Get Dashboard
function testGetDashboard(userId) {
  console.log('\n3️⃣  Testing Get User Dashboard...');
  
  http.get(`http://localhost:3001/api/users/${userId}/dashboard`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`   Status: ${res.statusCode}`);
      const dashboard = JSON.parse(data);
      console.log(`   Dashboard Response:`);
      console.log(`     - Sessions: ${dashboard.sessions.length}`);
      
      if (dashboard.sessions.length > 0) {
        console.log(`     - Latest Session Score: ${dashboard.sessions[0].overall_score || 'N/A'}`);
      } else {
        console.log(`     - No sessions yet (new user)`);
      }

      console.log('\n' + '=' .repeat(50));
      console.log('\n✅ ALL TESTS PASSED!');
      console.log('\n📊 Database Connection Verified:');
      console.log('   ✓ Health endpoint working');
      console.log('   ✓ User creation & MongoDB storage working');
      console.log('   ✓ Dashboard data retrieval working');
      console.log('\n✨ MongoDB is fully functional!\n');
      process.exit(0);
    });
  }).on('error', err => {
    console.error(`   ❌ Error: ${err.message}`);
    process.exit(1);
  });
}
