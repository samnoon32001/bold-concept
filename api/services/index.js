import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bold-concept');
    const collection = db.collection('services');

    switch (req.method) {
      case 'GET':
        const services = await collection.find({ active: true }).sort({ order: 1 }).toArray();
        return res.status(200).json(services);

      case 'POST':
        const serviceData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(serviceData);
        return res.status(201).json({ _id: result.insertedId, ...serviceData });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Services API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}
