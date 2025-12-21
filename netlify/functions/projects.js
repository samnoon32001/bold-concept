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
      // Check if this is a request for a specific project
      if (event.path && event.path.includes('/projects/')) {
        // Extract ID from path
        const pathParts = event.path.split('/');
        const id = pathParts[pathParts.length - 1];
        
        console.log('Getting single project with ID:', id);
        
        if (id && ObjectId.isValid(id)) {
          const project = await collection.findOne({ _id: new ObjectId(id) });
          if (!project) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Project not found' })
            };
          }
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(project)
          };
        }
      }
      
      // Get all projects
      console.log('=== GETTING ALL PROJECTS ===');
      const projects = await collection.find({}).toArray();
      console.log('Found projects count:', projects.length);
      console.log('Project IDs:', projects.map(p => p._id));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(projects)
      };
    }

    if (event.httpMethod === 'POST') {
      console.log('=== PROJECT CREATION DEBUG ===');
      console.log('Content-Type:', event.headers['content-type']);
      console.log('Body:', event.body);
      console.log('Body length:', event.body?.length);
      
      // Handle FormData for file uploads
      let projectData;
      
      if (event.headers['content-type'] && event.headers['content-type'].includes('multipart/form-data')) {
        // For now, handle as JSON since Netlify functions have limited FormData support
        // In production, you'd use a service like AWS S3 for file uploads
        projectData = JSON.parse(event.body);
      } else {
        projectData = JSON.parse(event.body);
      }
      
      console.log('Parsed project data:', projectData);
      console.log('Project data keys:', Object.keys(projectData));
      
      const result = await collection.insertOne({
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Insert result:', result);
      console.log('Inserted ID:', result.insertedId);
      
      const insertedProject = await collection.findOne({ _id: result.insertedId });
      console.log('Verified inserted project:', insertedProject);
      
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
      
      console.log('Update data keys:', Object.keys(updateData));
      console.log('Has previewImage:', !!updateData.previewImage);
      console.log('Has detailBannerImage:', !!updateData.detailBannerImage);
      console.log('Has galleryImages:', !!updateData.galleryImages);
      
      // Check if project exists
      const existingProject = await collection.findOne({ _id: new ObjectId(id) });
      if (!existingProject) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Project not found' })
        };
      }
      
      // Prepare the update object with image data
      const updateFields = {
        ...updateData,
        updatedAt: new Date()
      };
      
      console.log('Final update fields:', Object.keys(updateFields));
      
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
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
        body: JSON.stringify(updatedProject)
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
