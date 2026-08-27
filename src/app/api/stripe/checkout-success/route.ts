import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get('booking_id');
  const sessionId = searchParams.get('session_id');

  if (bookingId) {
    const db = getDb();
    const booking = db.bookings.find(b => b.id === bookingId);

    if (booking) {
      booking.status = booking.cleaner_id ? 'booked' : 'pending_match';
      saveDb(db);
    }
  }

  // Redirect to frontend app with success notification query param
  const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
  return NextResponse.redirect(`${baseUrl}?stripe_checkout=success&booking_id=${bookingId || ''}&session_id=${sessionId || ''}`);
}
