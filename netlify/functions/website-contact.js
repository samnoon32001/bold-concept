import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.VITE_MONGODB_URI;

exports.handler = async function(event, context) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bold-concept');
    const collection = db.collection('website-contact');

    if (event.httpMethod === 'GET') {
      let contactInfo = await collection.findOne({});
      
      // If no contact info exists, create default
      if (!contactInfo) {
        const defaultContact = {
          address: "Business Bay, Dubai, UAE\nP.O. Box 123456",
          phone: "+971 4 456 7890",
          email: "info@boldconcept.ae",
          workingHours: "Sun - Thu: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 2:00 PM",
          socialMedia: {
            facebook: "",
            instagram: "",
            linkedin: "",
            twitter: ""
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await collection.insertOne(defaultContact);
        contactInfo = { _id: result.insertedId, ...defaultContact };
      }
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(contactInfo)
      };
    }

    if (event.httpMethod === 'PUT') {
      const contactData = JSON.parse(event.body);
      
      const updateResult = await collection.updateOne(
        {}, // Update the first (and only) document
        { 
          $set: { 
            ...contactData, 
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      );
      
      // Return the updated document
      const updatedContact = await collection.findOne({});
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(updatedContact)
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
    console.error('Website Contact API error:', error);
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
