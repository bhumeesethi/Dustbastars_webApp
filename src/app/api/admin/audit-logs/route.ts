import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { AuditLogModel } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '50', 10));

    const auditLogs = await AuditLogModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      auditLogs
    });

  } catch (error: any) {
    console.error('[Admin Audit Logs API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
