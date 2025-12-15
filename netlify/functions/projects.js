import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.VITE_MONGODB_URI;

exports.handler = async function(event, context) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bold-concept');
    const collection = db.collection('projects');

    const projects = await collection.find({}).toArray();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(projects)
    };
  } catch (error) {
    console.error('Projects API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    await client.close();
  }
};
