import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { BookingModel } from '@/lib/models';
import { getDb, saveDb } from '@/lib/db';

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
      cleaningType = 'std_domestic',
      scheduledDate,
      scheduledStartTime = '14:00',
      unitsCount = 3,
      hourlyRate = 17.0,
      isEmergency = false,
      specialInstructions = '',
    } = body;

    console.log(`[API Bookings POST] Creating booking for customer "${customerId}", type: "${cleaningType}", date: ${scheduledDate}`);

    const subtotal = hourlyRate * unitsCount;
    const feePct = isEmergency ? 0.15 : 0.125;
    const commission = subtotal * feePct;
    const totalAmount = subtotal + commission;
    const depositAmount = totalAmount * 0.3; // 30% upfront deposit
    const cleanerPayout = subtotal;

    const bookingId = `bk_${Date.now()}`;
    const newBookingObj = {
      id: bookingId,
      customer_id: customerId,
      cleaner_id: cleanerId,
      property_id: propertyId,
      booking_type: 'direct_cleaner',
      cleaning_category: 'residential',
      cleaning_type: cleaningType,
      pricing_model: 'per_hour',
      units_count: Number(unitsCount),
      scheduled_date: scheduledDate || new Date().toISOString().split('T')[0],
      scheduled_start_time: scheduledStartTime,
      is_emergency: Boolean(isEmergency),
      is_afterhours: false,
      total_amount: Number(totalAmount.toFixed(2)),
      deposit_amount: Number(depositAmount.toFixed(2)),
      cleaner_payout_amount: Number(cleanerPayout.toFixed(2)),
      platform_commission: Number(commission.toFixed(2)),
      surge_bonus_amount: isEmergency ? 10.0 : 0,
      special_instructions: specialInstructions,
      status: 'booked',
      before_photos: [],
      after_photos: [],
      chat_unlocked_at: new Date().toISOString(),
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
