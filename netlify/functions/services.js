import { MongoClient, ObjectId } from 'mongodb';
import { Buffer } from 'buffer';

const uri = process.env.VITE_MONGODB_URI;

// Simple JWT verification
function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (error) {
    return null;
  }
}

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Verify authentication for non-GET requests
  if (event.httpMethod !== 'GET') {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bold-concept');
    const collection = db.collection('services');

    console.log('=== NETLIFY SERVICES DEBUG ===');
    console.log('HTTP Method:', event.httpMethod);
    console.log('Path Parameters:', event.pathParameters);
    console.log('Headers:', Object.keys(event.headers));
    console.log('Body type:', typeof event.body);
    console.log('Is base64 encoded:', event.isBase64Encoded);

    if (event.httpMethod === 'GET') {
      const services = await collection.find({}).sort({ order: 1 }).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(services)
      };
    }

    if (event.httpMethod === 'POST') {
      const serviceData = JSON.parse(event.body);
      
      const result = await collection.insertOne({
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...serviceData, _id: result.insertedId })
      };
    }

    if (event.httpMethod === 'PUT') {
      const { id } = event.pathParameters || {};
      
      console.log('Update ID:', id);
      
      if (!id || !ObjectId.isValid(id)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid service ID' })
        };
      }
      
      const updateData = JSON.parse(event.body);
      console.log('Update data:', updateData);
      
      // Check if service exists
      const existingService = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingService) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Service not found' })
        };
      }
      
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
      
      console.log('Update result:', updateResult);
      
      if (updateResult.matchedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Service not found after update' })
        };
      }
      
      // Return updated service
      const updatedService = await collection.findOne({ _id: new ObjectId(id) });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, service: updatedService })
      };
    }

    if (event.httpMethod === 'DELETE') {
      console.log('=== DELETE REQUEST DEBUG ===');
      console.log('Path parameters:', event.pathParameters);
      console.log('Path:', event.path);
      console.log('Raw path:', event.rawPath);
      console.log('Raw query:', event.rawQueryString);
      
      // Extract ID from multiple possible sources
      let id = null;
      
      // Try path parameters first
      if (event.pathParameters && event.pathParameters.id) {
        id = event.pathParameters.id;
        console.log('ID from pathParameters:', id);
      }
      // Try extracting from path
      else if (event.path) {
        const pathParts = event.path.split('/');
        id = pathParts[pathParts.length - 1];
        console.log('ID from path:', id);
      }
      // Try raw path
      else if (event.rawPath) {
        const pathParts = event.rawPath.split('/');
        id = pathParts[pathParts.length - 1];
        console.log('ID from rawPath:', id);
      }
      
      console.log('Final extracted ID:', id);
      
      if (!id) {
        console.log('No ID found in request');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No service ID provided' })
        };
      }
      
      if (!ObjectId.isValid(id)) {
        console.log('Invalid ObjectId format:', id);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid service ID format' })
        };
      }
      
      // Check if service exists
      const existingService = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingService) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Service not found' })
        };
      }
      
      const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
      
      console.log('Delete result:', deleteResult);
      
      if (deleteResult.deletedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Service not found after delete' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, deletedCount: deleteResult.deletedCount })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('=== NETLIFY SERVICES ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      })
    };
  } finally {
    await client.close();
  }
};
