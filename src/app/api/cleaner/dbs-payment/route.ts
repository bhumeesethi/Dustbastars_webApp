import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, dbsProvider = 'ucheck', simulateApproval = true } = body;

    const db = getDb();
    const profile = db.cleaner_profiles.find(p => p.user_id === userId);

    if (!profile) {
      return NextResponse.json({ error: 'Cleaner profile not found' }, { status: 404 });
    }

    profile.dbs_payment_status = 'paid';
    profile.dbs_provider = dbsProvider;
    
    if (simulateApproval) {
      profile.dbs_status = 'approved';
      profile.dbs_verified_at = new Date().toISOString();
    } else {
      profile.dbs_status = 'pending';
    }

    // Also update user status to active
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.status = profile.dbs_status === 'approved' && user.id_verified ? 'active' : 'pending_approval';
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      message: `DBS Check fee (£23.00) processed via ${dbsProvider.toUpperCase()}. Check status: ${profile.dbs_status.toUpperCase()}`,
      profile
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
