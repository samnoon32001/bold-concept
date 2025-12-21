import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.VITE_MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/bold-concept';

async function setupAdminAccounts() {
  console.log('=== SETTING UP ADMIN ACCOUNTS ===');
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('bold-concept');
    
    // Create admin users collection if it doesn't exist
    const adminUsers = db.collection('adminUsers');
    
    // Admin accounts to create
    const adminAccounts = [
      {
        email: 'samnoon3200@gmail.com',
        password: '320032',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'hallo@boldconcepts-ts.com',
        password: '123',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const results = [];
    
    for (const account of adminAccounts) {
      // Check if admin already exists
      const existingAdmin = await adminUsers.findOne({ email: account.email });
      
      if (existingAdmin) {
        console.log(`Admin ${account.email} already exists, skipping...`);
        results.push({ email: account.email, status: 'already exists' });
      } else {
        // Hash the password
        const hashedPassword = await bcrypt.hash(account.password, 10);
        
        // Insert new admin
        await adminUsers.insertOne({
          ...account,
          password: hashedPassword
        });
        
        console.log(`Created admin account: ${account.email}`);
        results.push({ email: account.email, status: 'created' });
      }
    }

    await client.close();
    
    console.log('=== SETUP COMPLETE ===');
    console.log('Results:', results);
    
    return results;

  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
}

// Run the setup
setupAdminAccounts()
  .then(results => {
    console.log('Admin accounts setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
