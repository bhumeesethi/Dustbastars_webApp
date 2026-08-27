import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isConnected = false;

export function getMongoUri(): string {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/MONGODB_URI=(.*)/);
      if (match && match[1]) {
        const uri = match[1].trim();
        if (uri && !uri.includes('<db_password>') && !uri.includes('<password>')) {
          process.env.MONGODB_URI = uri;
          return uri;
        }
      }
    }
  } catch (e) {
    console.error('Error reading .env.local:', e);
  }
  return process.env.MONGODB_URI || '';
}

export function formatMongoUri(rawUri: string): string {
  let uri = rawUri.trim();
  if (!uri.includes('mongodb+srv://') && !uri.includes('mongodb://')) return uri;

  const match = uri.match(/mongodb(?:\+srv)?:\/\/([^:]+):([^@]+)@/);
  if (match) {
    const pass = match[2];
    if (pass.includes('!') || pass.includes('#') || pass.includes('$') || pass.includes('@')) {
      if (!pass.includes('%')) {
        const encodedPass = encodeURIComponent(pass);
        uri = uri.replace(`:${pass}@`, `:${encodedPass}@`);
      }
    }
  }
  return uri;
}

export async function connectToMongoDB(overrideUri?: string): Promise<{ success: boolean; error?: string }> {
  let uriToUse = overrideUri || getMongoUri();
  uriToUse = formatMongoUri(uriToUse);

  if (!uriToUse || uriToUse.includes('<db_password>') || uriToUse.includes('<password>')) {
    console.log('[MongoDB] MONGODB_URI missing password or not configured - using local JSON database.');
    return { success: false, error: 'MONGODB_URI requires your actual database password in .env.local.' };
  }

  if (isConnected && !overrideUri && mongoose.connection.readyState === 1) {
    return { success: true };
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(uriToUse, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected successfully to MongoDB Atlas database!');
    return { success: true };
  } catch (error: any) {
    console.error('[MongoDB] Connection error:', error);
    isConnected = false;
    return { success: false, error: error.message || String(error) };
  }
}

export function isMongoConfigured(): boolean {
  const uri = getMongoUri();
  return Boolean(uri && !uri.includes('<db_password>') && !uri.includes('<password>'));
}
