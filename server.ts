import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
let db: Db;

async function connectDB() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  db = client.db('bold-concept');
  console.log('Connected to MongoDB');
}

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// JWT Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // For now, hardcoded admin credentials
    if (email === 'samnoon3200@gmail.com' && password === '320032') {
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      res.json({ token, user: { email, role: 'admin' } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Projects CRUD
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.collection('projects').find({}).toArray();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, upload.array('images'), async (req: any, res: any) => {
  try {
    const projectData = {
      ...req.body,
      images: req.files ? (req.files as Express.Multer.File[]).map((file: any) => `/uploads/${file.filename}`) : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('projects').insertOne(projectData);
    res.json({ ...projectData, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', authenticateToken, upload.array('images'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      images: req.files ? (req.files as Express.Multer.File[]).map((file: any) => `/uploads/${file.filename}`) : [],
      updatedAt: new Date()
    };
    
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ success: result.modifiedCount > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: result.deletedCount > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Contacts Management
app.get('/api/contacts', authenticateToken, async (req: any, res: any) => {
  try {
    const contacts = await db.collection('contacts').find({}).toArray();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('contacts').insertOne(contactData);
    res.json({ ...contactData, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact' });
  }
});

// Services Management
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.collection('services').find({}).sort({ order: 1 }).toArray();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/services', authenticateToken, async (req: any, res: any) => {
  try {
    const serviceData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('services').insertOne(serviceData);
    res.json({ ...serviceData, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Start server
async function startServer() {
  await connectDB();
  
  // Create uploads directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
