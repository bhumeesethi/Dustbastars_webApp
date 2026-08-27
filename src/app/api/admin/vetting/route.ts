import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { UserModel, CleanerProfileModel, AuditLogModel } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await req.json();
    const { userId, dbsStatus, adminName } = body;

    if (!userId || !['approved', 'rejected', 'pending'].includes(dbsStatus)) {
      return NextResponse.json({ success: false, error: 'Valid userId and dbsStatus required' }, { status: 400 });
    }

    const cleanerUser = await UserModel.findOne({ id: userId });
    if (!cleanerUser) {
      return NextResponse.json({ success: false, error: 'Cleaner user not found' }, { status: 404 });
    }

    let cleanerProfile = await CleanerProfileModel.findOne({ user_id: userId });
    if (!cleanerProfile) {
      cleanerProfile = new CleanerProfileModel({
        id: `cp_${userId}`,
        user_id: userId
      });
    }

    cleanerProfile.dbs_status = dbsStatus;
    if (dbsStatus === 'approved') {
      cleanerProfile.dbs_verified_at = new Date().toISOString();
      cleanerUser.id_verified = true;
      cleanerUser.status = 'active';
    } else if (dbsStatus === 'rejected') {
      cleanerUser.status = 'suspended';
    }

    await cleanerProfile.save();
    await cleanerUser.save();

    // Audit Log Entry
    try {
      await AuditLogModel.create({
        id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        admin_id: 'usr_admin_1',
        admin_name: adminName || 'System Administrator',
        action: `CLEANER_DBS_${dbsStatus.toUpperCase()}`,
        target_resource: `User:${userId}`,
        details: `Updated DBS vetting status for cleaner "${cleanerUser.full_name}" to ${dbsStatus}.`,
        status: 'success'
      });
    } catch (auditErr) {
      console.error('[Admin Vetting] Audit log error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Cleaner ${cleanerUser.full_name} DBS status set to ${dbsStatus}.`,
      profile: cleanerProfile,
      user: cleanerUser
    });

  } catch (error: any) {
    console.error('[Admin Vetting API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
