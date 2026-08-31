import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { BookingModel } from '@/lib/models';
import { getDb, saveDb } from '@/lib/db';
import { calculateBookingPrice } from '@/lib/services/pricing';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || 'usr_customer_1';
    const role = url.searchParams.get('role') || 'customer';

    console.log(`[API Bookings GET] Fetching bookings for ${role}: "${userId}"`);

    await connectToMongoDB();
    const query = role === 'cleaner' ? { cleaner_id: userId } : { customer_id: userId };
    let bookings = await BookingModel.find(query).lean();

    if (!bookings || bookings.length === 0) {
      const db = getDb();
      bookings = db.bookings.filter(b => role === 'cleaner' ? b.cleaner_id === userId : b.customer_id === userId) as any;
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('[API Bookings GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId = 'usr_customer_1',
      cleanerId = 'usr_cleaner_1',
      propertyId = 'prop_1',
      cleaningCategory = 'residential',
      cleaningType = 'std_domestic',
      scheduledDate,
      scheduledStartTime,
      scheduledTime,
      unitsCount = 3,
      cleanerCount = 1,
      hourlyRate = 17.0,
      isEmergency = false,
      specialInstructions = '',
    } = body;

    const sTime = scheduledTime || scheduledStartTime || '14:00';
    const sDate = scheduledDate || new Date().toISOString().split('T')[0];

    console.log(`[API Bookings POST] Creating booking for customer "${customerId}", type: "${cleaningType}", date: ${sDate}, cleaners: ${cleanerCount}`);

    const pricing = calculateBookingPrice({
      cleaningCategory,
      cleaningType,
      bookingType: 'direct_cleaner',
      scheduledDate: sDate,
      scheduledTime: sTime,
      unitsCount: Number(unitsCount),
      cleanerCount: Number(cleanerCount),
      isEmergencyOverride: Boolean(isEmergency),
      cleanerRates: {
        [cleaningType]: { enabled: true, charge_model: 'per_hour', amount: Number(hourlyRate) }
      } as any
    });

    const scheduledDateTime = new Date(`${sDate}T${sTime}:00`);
    const chatUnlockedAt = new Date(scheduledDateTime.getTime() - 30 * 60 * 1000).toISOString();

    const bookingId = `bk_${Date.now()}`;
    const newBookingObj = {
      id: bookingId,
      customer_id: customerId,
      cleaner_id: cleanerId,
      property_id: propertyId,
      booking_type: 'direct_cleaner',
      cleaning_category: cleaningCategory,
      cleaning_type: cleaningType,
      pricing_model: pricing.chargeModel,
      units_count: Number(unitsCount),
      cleaner_count: Number(pricing.cleanerCount),
      cleaners_assigned: cleanerId ? [cleanerId] : [],
      scheduled_date: sDate,
      scheduled_start_time: sTime,
      is_emergency: pricing.isEmergency,
      is_afterhours: pricing.isAfterhours,
      emergency_surcharge_amount: pricing.emergencySurchargeAmount,
      total_amount: pricing.finalTotalAmount,
      deposit_amount: pricing.depositAmount, // 100% upfront
      cleaner_payout_amount: pricing.cleanerPayoutAmount,
      platform_commission: pricing.platformCommission,
      surge_bonus_amount: pricing.surgeBonusAmount,
      special_instructions: specialInstructions,
      status: 'booked',
      before_photos: [],
      after_photos: [],
      chat_unlocked_at: chatUnlockedAt,
      created_at: new Date().toISOString(),
    };

    // Save to MongoDB Atlas
    const mongoRes = await connectToMongoDB();
    if (mongoRes.success) {
      await BookingModel.create(newBookingObj);
      console.log(`[API Bookings POST] SUCCESS: Booking ${bookingId} saved to MongoDB Atlas.`);
    }

    // Save to local DB fallback
    const db = getDb();
    db.bookings.push(newBookingObj as any);
    saveDb(db);

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully!',
      booking: newBookingObj,
    });
  } catch (error: any) {
    console.error('[API Bookings POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
