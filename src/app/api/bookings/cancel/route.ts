import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../../lib/db';
import { evaluateCancellationPolicy } from '../../../../lib/services/cancellation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, cancelledBy, cancellationReason } = body;

    if (!bookingId || !cancelledBy) {
      return NextResponse.json({ error: 'bookingId and cancelledBy are required' }, { status: 400 });
    }

    const db = getDb();
    const booking = db.bookings.find(b => b.id === bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const result = evaluateCancellationPolicy({
      booking,
      cancelledBy: cancelledBy as 'customer' | 'cleaner'
    });

    booking.status = cancelledBy === 'customer' ? 'cancelled_by_customer' : 'cancelled_by_cleaner';
    booking.cancellation_reason = cancellationReason || 'Cancelled by user';
    booking.cancellation_penalty_fee = result.penaltyFeeAmount;
    booking.refunded_amount = result.refundAmount;

    saveDb(db);

    return NextResponse.json({
      success: true,
      booking,
      cancellationEvaluation: result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
