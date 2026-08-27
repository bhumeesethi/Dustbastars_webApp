import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { UserModel, CleanerProfileModel, PropertyModel, BookingModel, AuditLogModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    await connectToMongoDB();

    const user = await UserModel.findOne({ id: userId }).lean();
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    let cleanerProfile = null;
    let properties: any[] = [];
    let bookings: any[] = [];
    let auditLogs: any[] = [];

    if (user.role === 'cleaner') {
      cleanerProfile = await CleanerProfileModel.findOne({ user_id: userId }).lean();
      bookings = await BookingModel.find({ cleaner_id: userId }).sort({ createdAt: -1 }).lean();
    } else if (user.role === 'customer') {
      properties = await PropertyModel.find({ user_id: userId }).lean();
      bookings = await BookingModel.find({ customer_id: userId }).sort({ createdAt: -1 }).lean();
    }

    auditLogs = await AuditLogModel.find({ target_resource: `User:${userId}` }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        cleaner_profile: cleanerProfile,
        properties,
        bookings,
        audit_logs: auditLogs
      }
    });

  } catch (error: any) {
    console.error('[Admin User Detail API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    await connectToMongoDB();

    const body = await req.json();
    const { full_name, email, phone, status, role, adminName } = body;

    const user = await UserModel.findOne({ id: userId });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const previousStatus = user.status;
    const changes: string[] = [];

    if (full_name && full_name !== user.full_name) {
      changes.push(`name: "${user.full_name}" -> "${full_name}"`);
      user.full_name = full_name;
    }
    if (email && email !== user.email) {
      changes.push(`email: "${user.email}" -> "${email}"`);
      user.email = email;
    }
    if (phone && phone !== user.phone) {
      changes.push(`phone: "${user.phone}" -> "${phone}"`);
      user.phone = phone;
    }
    if (status && status !== user.status) {
      changes.push(`status: "${user.status}" -> "${status}"`);
      user.status = status;
    }
    if (role && role !== user.role) {
      changes.push(`role: "${user.role}" -> "${role}"`);
      user.role = role;
    }

    await user.save();

    // Audit Log Entry
    try {
      await AuditLogModel.create({
        id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        admin_id: 'usr_admin_1',
        admin_name: adminName || 'System Administrator',
        action: status && status !== previousStatus ? `USER_STATUS_${status.toUpperCase()}` : 'USER_UPDATED',
        target_resource: `User:${userId}`,
        details: `Updated user profile (${user.full_name}): ${changes.join(', ') || 'No attributes changed'}.`,
        status: 'success'
      });
    } catch (auditErr) {
      console.error('[Admin User Update] Audit log error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `User ${user.full_name} updated successfully.`,
      user
    });

  } catch (error: any) {
    console.error('[Admin User Update API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    await connectToMongoDB();

    const user = await UserModel.findOne({ id: userId });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userName = user.full_name;
    const userRole = user.role;

    await UserModel.deleteOne({ id: userId });
    if (userRole === 'cleaner') {
      await CleanerProfileModel.deleteOne({ user_id: userId });
    } else if (userRole === 'customer') {
      await PropertyModel.deleteMany({ user_id: userId });
    }

    // Audit Log Entry
    try {
      await AuditLogModel.create({
        id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        admin_id: 'usr_admin_1',
        admin_name: 'System Administrator',
        action: 'USER_DELETED',
        target_resource: `User:${userId}`,
        details: `Permanently deleted ${userRole} account for "${userName}" (${user.email}).`,
        status: 'success'
      });
    } catch (auditErr) {
      console.error('[Admin User Delete] Audit log error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `User "${userName}" permanently deleted.`
    });

  } catch (error: any) {
    console.error('[Admin User Delete API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
