import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '../../../../lib/stripe';
import { getDb, saveDb, Booking } from '../../../../lib/db';
import { calculateBookingPrice } from '../../../../lib/services/pricing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      customerId = 'usr_customer_1',
      cleanerId,
      propertyId,
      bookingType = 'direct_cleaner',
      cleaningCategory = 'residential',
      cleaningType = 'std_domestic',
      unitsCount = 3,
      scheduledDate,
      scheduledTime = '14:00',
      customQuoteAmount,
      returnUrl = 'http://localhost:3000'
    } = body;

    const db = getDb();
    let booking: Booking | undefined;

    if (bookingId) {
      booking = db.bookings.find(b => b.id === bookingId);
    }

    let cleanerRates = undefined;
    let cleanerStripeAccountId = undefined;
    if (cleanerId || booking?.cleaner_id) {
      const targetCleanerId = cleanerId || booking?.cleaner_id;
      const profile = db.cleaner_profiles.find(p => p.user_id === targetCleanerId);
      if (profile) {
        cleanerRates = profile.rates;
        cleanerStripeAccountId = profile.stripe_account_id;
      }
    }

    // Calculate Pricing Engine
    const pricing = calculateBookingPrice({
      cleaningCategory: booking?.cleaning_category || cleaningCategory,
      cleaningType: booking?.cleaning_type || cleaningType,
      bookingType: booking?.booking_type || bookingType,
      scheduledDate: booking?.scheduled_date || scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: booking?.scheduled_start_time || scheduledTime,
      unitsCount: booking?.units_count || unitsCount,
      cleanerRates,
      customQuoteAmount: customQuoteAmount ? parseFloat(customQuoteAmount) : 0
    });

    if (!booking) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
      const chatUnlockTime = new Date(scheduledDateTime.getTime() - 20 * 60 * 1000).toISOString();

      booking = {
        id: `bk_${Date.now()}`,
        customer_id: customerId,
        cleaner_id: cleanerId || undefined,
        property_id: propertyId || 'prop_1',
        booking_type: bookingType,
        cleaning_category: cleaningCategory,
        cleaning_type: cleaningType,
        pricing_model: pricing.chargeModel,
        units_count: unitsCount,
        scheduled_date: scheduledDate,
        scheduled_start_time: scheduledTime,
        is_emergency: pricing.isEmergency,
        is_afterhours: pricing.isAfterhours,
        total_amount: pricing.finalTotalAmount,
        deposit_amount: pricing.depositAmount,
        cleaner_payout_amount: pricing.cleanerPayoutAmount,
        platform_commission: pricing.platformCommission,
        surge_bonus_amount: pricing.surgeBonusAmount,
        status: cleanerId ? 'booked' : 'pending_match',
        before_photos: [],
        after_photos: [],
        chat_unlocked_at: chatUnlockTime,
        created_at: new Date().toISOString()
      };
      db.bookings.push(booking);
      saveDb(db);
    }

    if (!isStripeConfigured()) {
      // Mock Stripe Checkout URL for development & testing without live secret keys
      const mockCheckoutUrl = `${returnUrl}/api/stripe/checkout-success?booking_id=${booking.id}&session_id=cs_mock_${Date.now()}`;
      return NextResponse.json({
        success: true,
        mode: 'mock_test',
        url: mockCheckoutUrl,
        booking,
        pricing
      });
    }

    // Live Stripe Checkout Session Creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `DustBustars Cleaning (${booking.cleaning_category.toUpperCase()} - ${booking.cleaning_type.replace(/_/g, ' ')})`,
              description: `Date: ${booking.scheduled_date} at ${booking.scheduled_start_time}. Includes 30% deposit (£${pricing.depositAmount.toFixed(2)}).`
            },
            unit_amount: Math.round(pricing.finalTotalAmount * 100) // Amount in pence
          },
          quantity: 1
        }
      ],
      metadata: {
        booking_id: booking.id,
        customer_id: booking.customer_id,
        cleaner_id: booking.cleaner_id || '',
        cleaner_stripe_account_id: cleanerStripeAccountId || '',
        deposit_amount: pricing.depositAmount.toString(),
        cleaner_payout: pricing.cleanerPayoutAmount.toString(),
        platform_commission: pricing.platformCommission.toString()
      },
      success_url: `${returnUrl}/api/stripe/checkout-success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?stripe_checkout=cancel&booking_id=${booking.id}`
    });

    return NextResponse.json({
      success: true,
      mode: 'live',
      url: session.url,
      sessionId: session.id,
      booking,
      pricing
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
