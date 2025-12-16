import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
let db: Db;

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('bold-concept');
    console.log('Connected to MongoDB Atlas');
    
    // Initialize collections with sample data if empty
    await initializeCollections();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function initializeCollections() {
  try {
    // Check if projects collection is empty
    const projectsCount = await db.collection('projects').countDocuments();
    if (projectsCount === 0) {
      const sampleProjects = [
        {
          title: "Azure Residence",
          description: "Luxury penthouse with panoramic Dubai skyline views",
          category: "residential",
          images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"],
          completionDate: new Date('2024-03-15'),
          location: "Palm Jumeirah, Dubai",
          client: "Private Client",
          featured: true,
          status: "completed",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Horizon Tower Office",
          description: "Modern corporate office space with advanced technology integration",
          category: "commercial",
          images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"],
          completionDate: new Date('2024-01-20'),
          location: "Business Bay, Dubai",
          client: "Horizon Group",
          featured: true,
          status: "completed",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Luxe Boutique Hotel",
          description: "Boutique hotel renovation with contemporary luxury design",
          category: "hospitality",
          images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop"],
          completionDate: new Date('2024-02-10'),
          location: "Downtown Dubai",
          client: "Luxe Hotels Group",
          featured: false,
          status: "completed",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      await db.collection('projects').insertMany(sampleProjects);
      console.log('Sample projects inserted');
    }

    // Check if services collection is empty
    const servicesCount = await db.collection('services').countDocuments();
    if (servicesCount === 0) {
      const sampleServices = [
        {
          title: "Interior Fit-Out",
          description: "Complete interior construction and finishing services for commercial and residential projects.",
          icon: "Building2",
          features: ["Commercial Fit-Outs", "Residential Finishing", "Partition Systems"],
          order: 1,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Design & Build",
          description: "Comprehensive turnkey solutions from initial concept through to project completion.",
          icon: "Paintbrush",
          features: ["Concept Development", "Space Planning", "Construction Management"],
          order: 2,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Renovation & Remodeling",
          description: "Transform existing spaces with our expert renovation services.",
          icon: "Hammer",
          features: ["Space Transformation", "Structural Upgrades", "System Modernization"],
          order: 3,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Project Management",
          description: "Expert project coordination ensuring on-time, on-budget delivery.",
          icon: "FolderKanban",
          features: ["Timeline Management", "Budget Control", "Quality Assurance"],
          order: 4,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Joinery Solutions",
          description: "Custom woodwork and joinery crafted to perfection.",
          icon: "Drill",
          features: ["Custom Furniture", "Built-in Cabinetry", "Kitchen Solutions"],
          order: 5,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "MEP Coordination",
          description: "Mechanical, electrical, and plumbing integration services.",
          icon: "Settings",
          features: ["HVAC Integration", "Electrical Planning", "Smart Building Tech"],
          order: 6,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      await db.collection('services').insertMany(sampleServices);
      console.log('Sample services inserted');
    }
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
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
    console.log('Updating project with ID:', id);
    console.log('Request body:', req.body);
    console.log('Files:', req.files);
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }
    
    const updateData = {
      ...req.body,
      images: req.files ? (req.files as Express.Multer.File[]).map((file: any) => `/uploads/${file.filename}`) : [],
      updatedAt: new Date()
    };
    
    // Remove undefined fields to prevent issues
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === 'undefined') {
        delete updateData[key];
      }
    });
    
    console.log('Update data:', updateData);
    
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: result.modifiedCount > 0 });
  } catch (error) {
    console.error('Error updating project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to update project', details: errorMessage });
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

// Website Contact Management
app.get('/api/website-contact', async (req, res) => {
  try {
    const contact = await db.collection('websiteContact').findOne();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch website contact' });
  }
});

app.put('/api/website-contact', authenticateToken, async (req: any, res: any) => {
  try {
    const contactData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await db.collection('websiteContact').updateOne(
      {}, 
      { $set: contactData },
      { upsert: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update website contact' });
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

app.post('/api/services', authenticateToken, upload.single('icon'), async (req: any, res: any) => {
  try {
    const serviceData = {
      ...req.body,
      icon: req.file ? `/uploads/${req.file.filename}` : req.body.icon || '',
      features: req.body.features ? JSON.parse(req.body.features) : [],
      order: parseInt(req.body.order) || 0,
      active: req.body.active === 'true' || req.body.active === true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('services').insertOne(serviceData);
    res.json({ ...serviceData, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/services/:id', authenticateToken, upload.single('icon'), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      icon: req.file ? `/uploads/${req.file.filename}` : req.body.icon || '',
      updatedAt: new Date()
    };
    
    const result = await db.collection('services').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ success: result.modifiedCount > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await db.collection('services').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: result.deletedCount > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Start server
async function startServer() {
  await connectDB();
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
