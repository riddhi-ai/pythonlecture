import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance: any = null;

export async function connectDB(): Promise<string> {
  let uri = ENV.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[Database] Connecting to configured MongoDB URI...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`[Database] Successfully connected to MongoDB Atlas / Remote Cluster.`);
      return uri;
    } catch (err: any) {
      console.warn(`[Database] Could not connect to remote MongoDB URI (${err.message}). Falling back to in-memory instance...`);
    }
  }

  try {
    console.log(`[Database] Initializing In-Memory MongoDB Server for turnkey zero-config execution...`);
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] Connected to In-Memory MongoDB instance at: ${uri}`);
    return uri;
  } catch (error: any) {
    console.error(`[Database] Failed to initialize in-memory MongoDB:`, error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}
