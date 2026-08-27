import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToMongoDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authorization token required.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    await connectToMongoDB();
    const adminUser = await UserModel.findOne({ id: payload.userId, role: 'admin' });

    if (!adminUser || adminUser.status === 'suspended') {
      return NextResponse.json({ success: false, error: 'Admin account inactive or suspended.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        full_name: adminUser.full_name,
        email: adminUser.email,
        role: adminUser.role,
        avatar_url: adminUser.avatar_url,
        status: adminUser.status
      }
    });

  } catch (error: any) {
    console.error('[Admin Auth Me API] Error verifying session:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
