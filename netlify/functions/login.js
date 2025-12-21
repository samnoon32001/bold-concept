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

    // Check for admin credentials
    if (email === 'samnoon3200@gmail.com' && password === '320032') {
      const token = jwt.sign(
        { email, role: 'admin' },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('Admin login successful');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Login successful',
          token,
          user: { email, role: 'admin' }
        })
      };
    }

    if (email === 'projects@boldconcepts-ts.com' && password === '123') {
      const token = jwt.sign(
        { email, role: 'admin' },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('Admin login successful');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Login successful',
          token,
          user: { email, role: 'admin' }
        })
      };
    }

    // For other users, check database (you can implement this later)
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('bold-concept');
    
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
