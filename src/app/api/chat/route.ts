import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { ChatMessageModel } from '@/lib/models';
import { getDb, saveDb, maskContactInfo } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const bookingId = url.searchParams.get('bookingId') || 'bk_demo_101';

    console.log(`[API Chat GET] Fetching chat messages for bookingId: "${bookingId}"`);

    const db = getDb();
    const booking = db.bookings.find(b => b.id === bookingId);

    // Verify 30-minute unlock window rule before job start time
    let isPortalUnlocked = true;
    let unlockTimeISO = null;

    if (booking && booking.scheduled_date && booking.scheduled_start_time) {
      const scheduledDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_start_time}:00`);
      const unlockTime = new Date(scheduledDateTime.getTime() - 30 * 60 * 1000); // 30 minutes before job begins
      unlockTimeISO = unlockTime.toISOString();
      const now = new Date();

      if (now < unlockTime && booking.status !== 'in_progress') {
        isPortalUnlocked = false;
      }
    }

    let messages: any[] = [];
    try {
      const mongoPromise = connectToMongoDB();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Connection Timeout')), 2500));
      const mongoRes = await Promise.race([mongoPromise, timeoutPromise]) as any;
      if (mongoRes && mongoRes.success) {
        messages = await ChatMessageModel.find({ booking_id: bookingId }).sort({ created_at: 1 }).lean();
      }
    } catch (dbErr: any) {
      console.warn('[API Chat GET] MongoDB query fallback to local DB:', dbErr?.message);
    }

    if (!messages || messages.length === 0) {
      messages = db.chat_messages.filter(m => m.booking_id === bookingId) as any;
    }

    // Mask any contact details in retrieved messages
    const sanitizedMessages = (messages || []).map(m => ({
      ...m,
      message: maskContactInfo(m.message)
    }));

    return NextResponse.json({
      success: true,
      messages: sanitizedMessages,
      is_portal_unlocked: isPortalUnlocked,
      unlock_time: unlockTimeISO,
      notice: isPortalUnlocked
        ? 'Masked Communication Portal Active. Personal contact info is hidden for privacy.'
        : 'Communication portal unlocks 30 minutes prior to scheduled job start time.'
    });
  } catch (error: any) {
    console.error('[API Chat GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId = 'bk_demo_101', senderId, senderRole, senderName, message } = body;

    console.log(`[API Chat POST] New chat message from "${senderName}" (${senderRole}): "${message}"`);

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message content cannot be empty.' }, { status: 400 });
    }

    const db = getDb();
    const booking = db.bookings.find(b => b.id === bookingId);

    if (booking && booking.scheduled_date && booking.scheduled_start_time) {
      const scheduledDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_start_time}:00`);
      const unlockTime = new Date(scheduledDateTime.getTime() - 30 * 60 * 1000);
      const now = new Date();

      if (now < unlockTime && booking.status !== 'in_progress') {
        return NextResponse.json({
          success: false,
          error: 'Portal Locked: Communication with cleaner/customer unlocks 30 minutes before the scheduled job start time.',
          unlock_time: unlockTime.toISOString()
        }, { status: 403 });
      }
    }

    // Apply strict contact info masking to censor phone numbers & emails
    const sanitizedMessage = maskContactInfo(message.trim());

    const msgObj = {
      id: `msg_${Date.now()}`,
      booking_id: bookingId,
      sender_id: senderId || 'usr_customer_1',
      sender_role: senderRole || 'customer',
      sender_name: senderName || 'User',
      message: sanitizedMessage,
      created_at: new Date().toISOString(),
    };

    // Save to MongoDB Atlas
    try {
      const mongoPromise = connectToMongoDB();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Connection Timeout')), 2500));
      const mongoRes = await Promise.race([mongoPromise, timeoutPromise]) as any;
      if (mongoRes && mongoRes.success) {
        await ChatMessageModel.create(msgObj);
        console.log(`[API Chat POST] SUCCESS: Message saved to MongoDB Atlas.`);
      }
    } catch (dbErr: any) {
      console.warn('[API Chat POST] MongoDB save fallback to local DB:', dbErr?.message);
    }

    // Save to local DB fallback
    db.chat_messages.push(msgObj as any);
    saveDb(db);

    return NextResponse.json({
      success: true,
      message: 'Message sent via masked portal!',
      chatMessage: msgObj
    });
  } catch (error: any) {
    console.error('[API Chat POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
