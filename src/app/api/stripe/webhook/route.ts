import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '../../../../lib/stripe';
import { getDb, saveDb } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: any;

  try {
    if (isStripeConfigured() && webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const db = getDb();

  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;
    const cleanerStripeAccountId = session.metadata?.cleaner_stripe_account_id;
    const cleanerPayoutAmount = session.metadata?.cleaner_payout;

    if (bookingId) {
      const booking = db.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = booking.cleaner_id ? 'booked' : 'pending_match';
        saveDb(db);
      }
    }

    // Trigger automated cleaner transfer payout via Stripe Connect if connected
    if (isStripeConfigured() && cleanerStripeAccountId && cleanerPayoutAmount) {
      try {
        const payoutPence = Math.round(parseFloat(cleanerPayoutAmount) * 100);
        await stripe.transfers.create({
          amount: payoutPence,
          currency: 'gbp',
          destination: cleanerStripeAccountId,
          description: `DustBustars Cleaner Payout for Booking ${bookingId}`
        });
      } catch (e) {
        console.error('Stripe Connect automated transfer payout error:', e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
