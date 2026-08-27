import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { UserModel, CleanerProfileModel } from '@/lib/models';
import { hashPassword, generateToken } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, password, role = 'customer', phone } = body;

    console.log(`[API Auth Register] Registration API called for email: "${email}", role: "${role}"`);

    // 1. Validation Checks
    if (!full_name || !email || !password) {
      console.warn('[API Auth Register] Validation failed: Missing required fields.');
      return NextResponse.json(
        { success: false, error: 'Full name, email address, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.warn('[API Auth Register] Validation failed: Password too short.');
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userId = `usr_${role}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 2. Hash Password Securely with Salt
    const { hash, salt } = hashPassword(password);
    console.log('[API Auth Register] Password securely hashed using NIST-compliant scrypt algorithm.');

    // 3. Connect to MongoDB Atlas
    const mongoRes = await connectToMongoDB();
    let savedInMongo = false;

    if (mongoRes.success) {
      console.log('[API Auth Register] MongoDB Atlas connection verified. Checking existing user...');
      const existingUser = await UserModel.findOne({ email: normalizedEmail });
      if (existingUser) {
        console.warn(`[API Auth Register] Email "${normalizedEmail}" is already registered in MongoDB Atlas.`);
        return NextResponse.json(
          { success: false, error: 'An account with this email address already exists. Please sign in instead.' },
          { status: 400 }
        );
      }

      // Create Mongoose User Document
      const newUserDoc = await UserModel.create({
        id: userId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        password_hash: hash,
        password_salt: salt,
        role: role as 'customer' | 'cleaner' | 'admin',
        phone: phone || '+44 7900 000000',
        id_verified: true,
        status: 'active',
        created_at: new Date().toISOString(),
      });

      console.log(`[API Auth Register] SUCCESS: User "${newUserDoc.email}" saved to MongoDB Atlas database with ID: ${newUserDoc.id}`);
      savedInMongo = true;

      // If cleaner, create default CleanerProfile in MongoDB Atlas
      if (role === 'cleaner') {
        await CleanerProfileModel.create({
          id: `cln_prof_${Date.now()}`,
          user_id: userId,
          base_hourly_rate: 18.0,
          min_booking_duration_hrs: 2,
          service_center_postcode: 'EC1M 3HA',
          bio: 'Newly registered independent cleaner in London.',
        });
        console.log(`[API Auth Register] Cleaner Profile initialized in MongoDB Atlas for user ID: ${userId}`);
      }
    } else {
      console.log('[API Auth Register] MongoDB Atlas not available, using local DB fallback.');
    }

    // 4. Sync with local DB fallback (data_db.json)
    const db = getDb();
    const existingLocal = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingLocal && !savedInMongo) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists in local DB.' },
        { status: 400 }
      );
    }

    const newUserObj = {
      id: userId,
      full_name: full_name.trim(),
      email: normalizedEmail,
      role: role as 'customer' | 'cleaner' | 'admin',
      phone: phone || '+44 7900 000000',
      id_verified: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
    };

    if (!existingLocal) {
      db.users.push(newUserObj);
      saveDb(db);
      console.log(`[API Auth Register] User synchronized to local JSON store.`);
    }

    // 5. Generate Auth Session Token
    const token = generateToken(userId, role as any, normalizedEmail, full_name.trim());
    console.log(`[API Auth Register] Auth session token created for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        role,
        phone: newUserObj.phone,
      },
    });
  } catch (error: any) {
    console.error('[API Auth Register] Server error during registration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
