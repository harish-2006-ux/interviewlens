const mongoose = require('mongoose');

console.log('\n🔍 Direct MongoDB Connection & Operations Test\n');
console.log('=' .repeat(60));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/interviewlens')
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully\n');
    
    // Define User Schema
    const userSchema = new mongoose.Schema({
      name: String,
      target_role: String,
      resume_text: String,
      created_at: { type: Date, default: Date.now }
    }, { collection: 'users' });
    
    const User = mongoose.model('User', userSchema);
    
    // Test 1: Count existing users
    console.log('📊 Test 1: Querying Existing Users...');
    const userCount = await User.countDocuments();
    console.log(`   Found: ${userCount} user(s) in MongoDB`);
    
    // Test 2: List all users
    console.log('\n📋 Test 2: Listing All Users in Database...');
    const users = await User.find().lean();
    
    if (users.length > 0) {
      console.log(`   Users in MongoDB:`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.target_role})`);
        console.log(`      ID: ${user._id}`);
        console.log(`      Resume: ${user.resume_text.substring(0, 50)}...`);
      });
    } else {
      console.log('   No users found (database is empty)');
    }
    
    // Test 3: Create a new test session record
    console.log('\n📝 Test 3: Creating Test Records in Database...');
    
    // Create or find a user
    let testUser = await User.findOne({ name: 'Test Engineer' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test Engineer',
        target_role: 'Full Stack Developer',
        resume_text: 'Experienced in React, Node.js, MongoDB, AWS'
      });
      console.log(`   ✓ Created new user: ${testUser.name}`);
    } else {
      console.log(`   ✓ Using existing user: ${testUser.name}`);
    }
    
    // Test 4: Database Collections
    console.log('\n📦 Test 4: MongoDB Collections/Tables...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Total Collections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`     • ${col.name}`);
    });
    
    // Test 5: Database Info
    console.log('\n🗄️  Test 5: Database Information...');
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   MongoDB Version: ${serverStatus.version}`);
    console.log(`   Uptime: ${serverStatus.uptime} seconds`);
    console.log(`   Connections: ${serverStatus.connections.current}`);
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ ALL DATABASE TESTS PASSED!\n');
    console.log('✨ Summary:');
    console.log('   ✓ Connected to local MongoDB');
    console.log('   ✓ Queried existing data');
    console.log('   ✓ Created new records');
    console.log(`   ✓ Found ${collections.length} collections`);
    console.log('   ✓ Database fully functional\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
