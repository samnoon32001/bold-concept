import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.VITE_MONGODB_URI;

exports.handler = async function(event, context) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bold-concept');
    const collection = db.collection('services');

    if (event.httpMethod === 'GET') {
      const services = await collection.find({ active: true }).sort({ order: 1 }).toArray();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(services)
      };
    }

    if (event.httpMethod === 'PUT') {
      const { id } = event.pathParameters || {};
      const serviceData = JSON.parse(event.body);
      
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...serviceData, updatedAt: new Date() } }
      );
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(updateResult.modifiedCount > 0)
      };
    }

    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Services API error:', error);
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
