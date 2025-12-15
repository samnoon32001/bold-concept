import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

export default async function handler(req, res) {
  console.log('=== LOGIN API DEBUG ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Environment variables:', {
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
  });
  
  if (req.method !== 'POST') {
    console.log('Method not allowed, returning 405');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check for admin credentials
    if (email === 'samnoon3200@gmail.com' && password === '320032') {
      const token = jwt.sign(
        { email, role: 'admin' },
        jwtSecret,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: { email, role: 'admin' }
      });
    }

    // For other users, check database (you can implement this later)
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('bold-concept');
    
    const user = await db.collection('users').findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await client.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    await client.close();

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
