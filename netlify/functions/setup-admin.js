import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.VITE_MONGODB_URI;

exports.handler = async function(event, context) {
  console.log('=== SETUP ADMIN ACCOUNTS ===');

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Admin accounts setup completed',
        results
      })
    };

  } catch (error) {
    console.error('Setup error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
