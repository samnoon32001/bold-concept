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

      // If admin user not found in database, return error
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid email or password' })
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
