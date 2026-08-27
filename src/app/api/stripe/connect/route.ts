import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '../../../../lib/stripe';
import { getDb, saveDb } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'usr_cleaner_1';

  const db = getDb();
  const profile = db.cleaner_profiles.find(p => p.user_id === userId);

  if (!profile) {
    return NextResponse.json({ error: 'Cleaner profile not found' }, { status: 404 });
  }

  if (!profile.stripe_account_id) {
    return NextResponse.json({
      connected: false,
      stripe_account_id: null,
      payout_enabled: false
    });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({
      connected: true,
      stripe_account_id: profile.stripe_account_id,
      payout_enabled: profile.payout_enabled,
      mode: 'mock_test'
    });
  }

  try {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    profile.payout_enabled = Boolean(account.payouts_enabled && account.charges_enabled);
    saveDb(db);

    return NextResponse.json({
      connected: true,
      stripe_account_id: account.id,
      payout_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: true,
      stripe_account_id: profile.stripe_account_id,
      payout_enabled: profile.payout_enabled,
      error: err.message
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 'usr_cleaner_1', returnUrl = 'http://localhost:3000' } = body;

    const db = getDb();
    const profile = db.cleaner_profiles.find(p => p.user_id === userId);
    const user = db.users.find(u => u.id === userId);

    if (!profile) {
      return NextResponse.json({ error: 'Cleaner profile not found' }, { status: 404 });
    }

    if (!isStripeConfigured()) {
      // Mock Stripe Connect onboarding for development / testing without live keys
      const mockStripeAccountId = profile.stripe_account_id || `acct_mock_express_${Date.now().toString().slice(-6)}`;
      profile.stripe_account_id = mockStripeAccountId;
      profile.payout_enabled = true;
      saveDb(db);

      return NextResponse.json({
        success: true,
        mode: 'mock_test',
        stripe_account_id: mockStripeAccountId,
        url: `${returnUrl}?stripe_connect=success&account_id=${mockStripeAccountId}`,
        message: 'Mock Stripe Connect Express Account linked successfully!'
      });
    }

    // Live Stripe Connect Express Account Creation
    let stripeAccountId = profile.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB',
        email: user?.email || 'cleaner@dustbustars.co.uk',
        capabilities: {
          transfers: { requested: true }
        },
        business_type: 'individual',
        individual: {
          first_name: user?.full_name.split(' ')[0] || 'Cleaner',
          last_name: user?.full_name.split(' ')[1] || 'Partner'
        }
      });
      stripeAccountId = account.id;
      profile.stripe_account_id = stripeAccountId;
      saveDb(db);
    }

    // Generate Stripe Express Account Onboarding Link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${returnUrl}?stripe_connect=refresh`,
      return_url: `${returnUrl}?stripe_connect=success&account_id=${stripeAccountId}`,
      type: 'account_onboarding'
    });

    return NextResponse.json({
      success: true,
      mode: 'live',
      stripe_account_id: stripeAccountId,
      url: accountLink.url
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
