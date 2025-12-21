import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.VITE_MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

exports.handler = async function(event, context) {
  console.log('=== LOGIN API DEBUG ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', event.headers);
  console.log('Body:', event.body);
  console.log('Environment variables:', {
    VITE_MONGODB_URI: process.env.VITE_MONGODB_URI ? 'SET' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
  });

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed, returning 405');
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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    let client, db;
    try {
      client = new MongoClient(uri);
      await client.connect();
      db = client.db('bold-concept');
      
      // Check admin users collection first
      const adminUser = await db.collection('adminUsers').findOne({ email });
      
      if (adminUser && await bcrypt.compare(password, adminUser.password)) {
        const token = jwt.sign(
          { email: adminUser.email, role: adminUser.role },
          jwtSecret,
          { expiresIn: '24h' }
        );

        await client.close();
        console.log('Admin login successful via database');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            message: 'Login successful',
            token,
            user: { email: adminUser.email, role: adminUser.role }
          })
        };
      }

      // Auto-create admin accounts in database if they don't exist
      const hardcodedAdmins = [
        { email: 'samnoon3200@gmail.com', password: '320032' },
        { email: 'hallo@boldconcepts-ts.com', password: '123' }
      ];

      const matchingAdmin = hardcodedAdmins.find(admin => admin.email === email);
      
      if (matchingAdmin && matchingAdmin.password === password) {
        // Create admin account in database
        const hashedPassword = await bcrypt.hash(matchingAdmin.password, 10);
        
        await db.collection('adminUsers').insertOne({
          email: matchingAdmin.email,
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const token = jwt.sign(
          { email: matchingAdmin.email, role: 'admin' },
          jwtSecret,
          { expiresIn: '24h' }
        );

        await client.close();
        console.log(`Admin account ${matchingAdmin.email} created in database and login successful`);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            message: 'Login successful',
            token,
            user: { email: matchingAdmin.email, role: 'admin' }
          })
        };
      }
    } catch (dbError) {
      console.error('Database error during admin check:', dbError);
      if (client) await client.close();
    }

    // For other users, check database (reuse existing connection if available)
    if (!client) {
      try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('bold-concept');
      } catch (connectionError) {
        console.error('Database connection error:', connectionError);
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Database connection failed' })
        };
      }
    }
    
    const user = await db.collection('users').findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await client.close();
      console.log('Invalid credentials');
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    await client.close();

    console.log('User login successful');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Login successful',
        token,
        user: { email: user.email, role: user.role }
      })
    };

  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error stack:', error.stack);
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
