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
    const collection = db.collection('projects');

    console.log('=== NETLIFY PROJECTS DEBUG ===');
    console.log('HTTP Method:', event.httpMethod);
    console.log('Path:', event.path);
    console.log('Path Parameters:', event.pathParameters);
    console.log('Headers:', Object.keys(event.headers));
    console.log('Body type:', typeof event.body);
    console.log('Is base64 encoded:', event.isBase64Encoded);

    if (event.httpMethod === 'GET') {
      const projects = await collection.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(projects)
      };
    }

    if (event.httpMethod === 'POST') {
      // Handle FormData for file uploads
      let projectData;
      
      if (event.headers['content-type'] && event.headers['content-type'].includes('multipart/form-data')) {
        // For now, handle as JSON since Netlify functions have limited FormData support
        // In production, you'd use a service like AWS S3 for file uploads
        projectData = JSON.parse(event.body);
      } else {
        projectData = JSON.parse(event.body);
      }
      
      const result = await collection.insertOne({
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...projectData, _id: result.insertedId })
      };
    }

    if (event.httpMethod === 'PUT') {
      // Try to get ID from path parameters first, then from path
      let id = event.pathParameters?.id;
      
      if (!id && event.path) {
        const pathParts = event.path.split('/');
        id = pathParts[pathParts.length - 1];
      }
      
      console.log('Update ID:', id);
      console.log('ID type:', typeof id);
      console.log('ObjectId.isValid result:', ObjectId.isValid(id));
      
      if (!id) {
        console.log('ID is missing');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing project ID' })
        };
      }
      
      if (!ObjectId.isValid(id)) {
        console.log('Invalid ObjectId format:', id);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid project ID format' })
        };
      }
      
      let updateData;
      
      // Handle FormData for file uploads
      if (event.headers['content-type'] && event.headers['content-type'].includes('multipart/form-data')) {
        // For now, handle as JSON since Netlify functions have limited FormData support
        updateData = JSON.parse(event.body);
      } else {
        updateData = JSON.parse(event.body);
      }
      
      console.log('Update data:', updateData);
      
      // Check if project exists
      const existingProject = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingProject) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Project not found' })
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
          body: JSON.stringify({ error: 'Project not found after update' })
        };
      }
      
      // Return updated project
      const updatedProject = await collection.findOne({ _id: new ObjectId(id) });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, project: updatedProject })
      };
    }

    if (event.httpMethod === 'DELETE') {
      const { id } = event.pathParameters || {};
      
      if (!id || !ObjectId.isValid(id)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid project ID' })
        };
      }
      
      const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(deleteResult.deletedCount > 0)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('=== NETLIFY PROJECTS ERROR ===');
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
