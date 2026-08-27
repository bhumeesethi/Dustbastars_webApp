import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { connectToMongoDB, isMongoConfigured } from '../../../../lib/mongodb';
import { initMongoAndSeed, getMongoStats } from '../../../../lib/mongoSync';

export async function GET(req: NextRequest) {
  try {
    const isConfigured = isMongoConfigured();
    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        status: 'not_configured',
        message: 'MONGODB_URI in .env.local contains <db_password> placeholder. Replace it with your actual password.',
        isMongoConfigured: false
      });
    }

    const connRes = await connectToMongoDB();
    if (!connRes.success) {
      return NextResponse.json({
        success: false,
        status: 'connection_error',
        message: `Failed to connect to MongoDB Atlas: ${connRes.error}. Please check password or Network Access (Allow 0.0.0.0/0).`,
        error: connRes.error,
        isMongoConfigured: true
      });
    }

    await initMongoAndSeed();
    const statsRes = await getMongoStats();

    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'MongoDB Atlas Connected & Synchronized Successfully!',
      isMongoConfigured: true,
      stats: statsRes.stats
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mongoUri } = await req.json();
    if (!mongoUri || typeof mongoUri !== 'string') {
      return NextResponse.json({ error: 'Valid MongoDB URI string is required' }, { status: 400 });
    }

    if (mongoUri.includes('<db_password>') || mongoUri.includes('<password>')) {
      return NextResponse.json({
        error: 'Please replace <db_password> with your actual MongoDB password before connecting.'
      }, { status: 400 });
    }

    const connRes = await connectToMongoDB(mongoUri.trim());
    if (!connRes.success) {
      return NextResponse.json({
        error: `MongoDB Atlas Connection Error: ${connRes.error}. Please verify password and Network Access (Allow 0.0.0.0/0).`
      }, { status: 400 });
    }

    // Save URI into .env.local
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(/MONGODB_URI=.*/g, `MONGODB_URI=${mongoUri.trim()}`);
      } else {
        envContent += `\n\nMONGODB_URI=${mongoUri.trim()}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
      process.env.MONGODB_URI = mongoUri.trim();
    } catch (fsErr) {
      console.error('Error saving .env.local:', fsErr);
    }

    await initMongoAndSeed();
    const statsRes = await getMongoStats();

    return NextResponse.json({
      success: true,
      message: '🎉 MongoDB Atlas Connected & Seeded Successfully!',
      stats: statsRes.stats
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
