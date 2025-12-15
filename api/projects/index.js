import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bold-concept');
    const collection = db.collection('projects');

    switch (req.method) {
      case 'GET':
        const projects = await collection.find({}).toArray();
        return res.status(200).json(projects);

      case 'POST':
        const projectData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(projectData);
        return res.status(201).json({ _id: result.insertedId, ...projectData });

      case 'PUT':
        const { id } = req.query;
        const updateData = {
          ...req.body,
          updatedAt: new Date()
        };
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        return res.status(200).json(updateResult.modifiedCount > 0);

      case 'DELETE':
        const deleteId = req.query.id;
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(deleteId) });
        return res.status(200).json(deleteResult.deletedCount > 0);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}
