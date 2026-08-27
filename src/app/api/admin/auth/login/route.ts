import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { UserModel, AuditLogModel } from '@/lib/models';
import { generateToken, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    const body = await req.json();
    const { username, password } = body;

    console.log(`[Admin Auth API] Login attempt received for username: "${username}"`);

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required.' }, { status: 400 });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Check development/demo admin credentials or database admin
    const isDevAdmin = (cleanUsername === 'admin' || cleanUsername === 'admin@dustbustars.co.uk') && password === 'admin1234';

    let adminUser = await UserModel.findOne({
      $or: [{ email: cleanUsername }, { id: cleanUsername }],
      role: 'admin'
    });

    let isAuthenticated = false;

    if (isDevAdmin) {
      isAuthenticated = true;
      if (!adminUser) {
        // Ensure dev admin user exists in DB
        const { hash, salt } = hashPassword('admin1234');
        adminUser = await UserModel.create({
          id: 'usr_admin_1',
          role: 'admin',
          email: 'admin@dustbustars.co.uk',
          full_name: 'System Administrator',
          phone: '+44 7000 000000',
          password_hash: hash,
          password_salt: salt,
          status: 'active',
          id_verified: true
        });
      }
    } else if (adminUser && adminUser.password_hash && adminUser.password_salt) {
      isAuthenticated = verifyPassword(password, adminUser.password_hash, adminUser.password_salt);
    }

    if (!isAuthenticated || !adminUser) {
      console.warn(`[Admin Auth API] Invalid login credentials for: "${cleanUsername}"`);
      return NextResponse.json({ success: false, error: 'Invalid admin username or password.' }, { status: 401 });
    }

    if (adminUser.status === 'suspended') {
      return NextResponse.json({ success: false, error: 'This admin account has been suspended.' }, { status: 403 });
    }

    const token = generateToken(adminUser.id, 'admin', adminUser.email, adminUser.full_name);

    // Create Audit Log Entry
    try {
      await AuditLogModel.create({
        id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        admin_id: adminUser.id,
        admin_name: adminUser.full_name,
        action: 'ADMIN_LOGIN',
        target_resource: `User:${adminUser.id}`,
        details: 'Admin authenticated successfully into Admin Portal.',
        status: 'success'
      });
    } catch (auditErr) {
      console.error('[Admin Auth API] Audit log error:', auditErr);
    }

    console.log(`[Admin Auth API] Admin authenticated cleanly: ${adminUser.full_name} (${adminUser.email})`);

    return NextResponse.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: adminUser.id,
        full_name: adminUser.full_name,
        email: adminUser.email,
        role: adminUser.role,
        avatar_url: adminUser.avatar_url
      }
    });

  } catch (error: any) {
    console.error('[Admin Auth API] Internal server error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
