import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToMongoDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const url = new URL(req.url);
      token = url.searchParams.get('token') || '';
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'No authorization token provided.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Session expired or invalid token.' }, { status: 401 });
    }

    // Connect to MongoDB Atlas to fetch latest user info
    await connectToMongoDB();
    let user = await UserModel.findOne({ email: payload.email }).lean();

    if (!user) {
      const db = getDb();
      user = db.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase()) as any;
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'User account no longer exists.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('[API Auth Me] Error verifying session:', error);
    return NextResponse.json({ success: false, error: 'Session verification failed.' }, { status: 500 });
  }
}
