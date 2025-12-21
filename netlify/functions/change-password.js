import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const jwtSecret = process.env.JWT_SECRET;
const uri = process.env.VITE_MONGODB_URI;

exports.handler = async function(event, context) {
  console.log('=== CHANGE PASSWORD API DEBUG ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', event.headers);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { currentPassword, newPassword } = JSON.parse(event.body);
    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'No token provided' })
      };
    }

    if (!currentPassword || !newPassword) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Current password and new password are required' })
      };
    }

    // Verify token and get user email
    const decoded = jwt.verify(token, jwtSecret);
    const userEmail = decoded.email;

    // Connect to database
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('bold-concept');

    try {
      // Check if user exists in adminUsers collection
      const adminUser = await db.collection('adminUsers').findOne({ email: userEmail });
      
      if (adminUser) {
        // Database admin user - implement real password change
        console.log('Found admin user in database, implementing password change');
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, adminUser.password);
        if (!isValidPassword) {
          await client.close();
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Current password is incorrect' })
          };
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.collection('adminUsers').updateOne(
          { email: userEmail },
          { 
            $set: { 
              password: hashedNewPassword, 
              updatedAt: new Date() 
            } 
          }
        );

        await client.close();
        console.log('Password changed successfully for database admin user');

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            message: 'Password changed successfully',
            email: userEmail
          })
        };
      }

      // Fallback to hardcoded admin accounts
      if (userEmail === 'samnoon3200@gmail.com' || userEmail === 'hallo@boldconcepts-ts.com') {
        await client.close();
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            message: 'Password change for hardcoded admin accounts is not yet implemented. This feature requires database integration.',
            note: 'Please run the setup-admin script to migrate admin accounts to database for password changes.',
            action: 'Contact administrator to run setup-admin function'
          })
        };
      }

      // User not found
      await client.close();
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'User not found' })
      };

    } catch (dbError) {
      await client.close();
      throw dbError;
    }

  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
