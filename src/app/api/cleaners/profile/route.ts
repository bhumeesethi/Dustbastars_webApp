import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { CleanerProfileModel } from '@/lib/models';
import { getDb, saveDb } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 'usr_cleaner_1', baseHourlyRate, minDuration, postcode, radius, bio, optInEmergency } = body;

    console.log(`[API Cleaner Profile PATCH] Updating profile for cleaner userId: "${userId}"`);

    await connectToMongoDB();
    const updateData: any = {};
    if (baseHourlyRate !== undefined) updateData.base_hourly_rate = Number(baseHourlyRate);
    if (minDuration !== undefined) updateData.min_booking_duration_hrs = Number(minDuration);
    if (postcode !== undefined) updateData.service_center_postcode = String(postcode);
    if (radius !== undefined) updateData.service_radius_miles = Number(radius);
    if (bio !== undefined) updateData.bio = String(bio);
    if (optInEmergency !== undefined) updateData.opt_in_emergency = Boolean(optInEmergency);

    const updatedProfile = await CleanerProfileModel.findOneAndUpdate(
      { user_id: userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    console.log(`[API Cleaner Profile PATCH] SUCCESS: Profile updated in MongoDB Atlas for cleaner ${userId}`);

    // Update local DB fallback
    const db = getDb();
    const localProfIndex = db.cleaner_profiles.findIndex(p => p.user_id === userId);
    if (localProfIndex !== -1) {
      if (baseHourlyRate !== undefined) db.cleaner_profiles[localProfIndex].base_hourly_rate = Number(baseHourlyRate);
      if (postcode !== undefined) db.cleaner_profiles[localProfIndex].service_center_postcode = String(postcode);
      if (radius !== undefined) db.cleaner_profiles[localProfIndex].service_radius_miles = Number(radius);
      if (bio !== undefined) db.cleaner_profiles[localProfIndex].bio = String(bio);
      if (optInEmergency !== undefined) db.cleaner_profiles[localProfIndex].opt_in_emergency = Boolean(optInEmergency);
      saveDb(db);
    }

    return NextResponse.json({
      success: true,
      message: 'Cleaner profile updated successfully!',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('[API Cleaner Profile PATCH] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
