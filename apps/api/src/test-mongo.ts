// src/test-extraction.ts
import mongoose from 'mongoose';
import logger from './utils/logger.js';

import { CALL_STATUS, ExtractionJob } from '@repo/mongoose-schema';
import getDb from './services/mongodb.js';


const MONGODB_URI = 'mongodb://root:example@localhost:27017/admin?authSource=admin';

async function testExtractionJob() {
  try {
    logger.log('info', 'Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      directConnection: true,
      bufferCommands: false
    });
    
    // Test job creation
    const testData = {
      username: 'testuser',
      password: 'testpass',
      status: CALL_STATUS.SCHEDULED // adjust according to your enum
    };

    logger.log('info', 'Creating test extraction job...');
    const db = mongoose.connection.db;
    if(!db) {
      throw new Error('No database connection');
    }
    // List collections
    const collections = await db.listCollections().toArray();
    logger.log('info', `Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Test write operation
    const testCollection = db.collection('extractionjob');
    await testCollection.insertOne({ username: 'testuser', password: 'testpass', status: CALL_STATUS.SCHEDULED, });
    logger.log('info', 'Test document inserted successfully');
    
    // Close connection
    await mongoose.disconnect();
    logger.log('info', 'Connection closed');
    logger.log('info', 'Test completed successfully');
  } catch (error) {
    logger.log('error', `Test failed: ${error}`);
  } finally {
    process.exit();
  }
}

testExtractionJob();