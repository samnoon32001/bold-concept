import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;

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

    // For hardcoded admin accounts, we can't actually change the password
    // This would need to be implemented with a database or environment variables
    // For now, we'll return a message indicating this limitation
    if (userEmail === 'samnoon3200@gmail.com' || userEmail === 'projects@boldconcepts-ts.com') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          message: 'Password change for hardcoded admin accounts is not yet implemented. This feature requires database integration.',
          note: 'For production, consider storing admin credentials in a secure database with proper password hashing.'
        })
      };
    }

    // For database users (future implementation)
    // const client = new MongoClient(process.env.VITE_MONGODB_URI);
    // await client.connect();
    // const db = client.db('bold-concept');
    // 
    // const user = await db.collection('users').findOne({ email: userEmail });
    // if (!user) {
    //   await client.close();
    //   return {
    //     statusCode: 404,
    //     body: JSON.stringify({ error: 'User not found' })
    //   };
    // }
    // 
    // // Verify current password
    // const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    // if (!isValidPassword) {
    //   await client.close();
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ error: 'Current password is incorrect' })
    //   };
    // }
    // 
    // // Hash new password
    // const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // 
    // // Update password
    // await db.collection('users').updateOne(
    //   { email: userEmail },
    //   { $set: { password: hashedNewPassword, updatedAt: new Date() } }
    // );
    // 
    // await client.close();
    // 
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ message: 'Password changed successfully' })
    // };

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
