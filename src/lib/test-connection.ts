import { connectToDatabase } from '../lib/mongodb';

// Test MongoDB connection
export async function testMongoConnection() {
  try {
    const db = await connectToDatabase();
    console.log('Successfully connected to MongoDB!');
    
    // Test basic operations
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections);
    
    // Create a test collection if it doesn't exist
    const testCollection = db.collection('test');
    
    // Insert a test document
    const testDoc = {
      message: 'MongoDB connection test successful!',
      timestamp: new Date(),
      project: 'bold-concept'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log('Test document inserted:', result.insertedId);
    
    // Query the test document
    const foundDoc = await testCollection.findOne({ _id: result.insertedId });
    console.log('Test document found:', foundDoc);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('Test document cleaned up');
    
    return true;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testMongoConnection();
}
