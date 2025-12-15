import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bold-concept');
    const collection = db.collection('contacts');

    switch (req.method) {
      case 'GET':
        const contacts = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(contacts);

      case 'POST':
        const contactData = {
          ...req.body,
          status: 'new',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(contactData);
        return res.status(201).json({ _id: result.insertedId, ...contactData });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Contacts API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}
