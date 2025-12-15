const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://bold-concept-cluster:320032Ss%2F@bold-concept-cluster.be381j1.mongodb.net/?appName=bold-concept-cluster';

async function loadData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('bold-concept');
    
    // Clear existing data
    await db.collection('projects').deleteMany({});
    await db.collection('services').deleteMany({});
    console.log('Cleared existing data');
    
    // Insert sample projects
    const projects = [
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
    
    await db.collection('projects').insertMany(projects);
    console.log('Inserted projects:', projects.length);
    
    // Insert sample services
    const services = [
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
    
    await db.collection('services').insertMany(services);
    console.log('Inserted services:', services.length);
    
    // Verify data
    const projectCount = await db.collection('projects').countDocuments();
    const serviceCount = await db.collection('services').countDocuments();
    
    console.log('Database loaded successfully!');
    console.log('Projects:', projectCount);
    console.log('Services:', serviceCount);
    
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    await client.close();
  }
}

loadData();
