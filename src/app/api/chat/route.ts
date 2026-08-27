import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { ChatMessageModel } from '@/lib/models';
import { getDb, saveDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const bookingId = url.searchParams.get('bookingId') || 'bk_demo_101';

    console.log(`[API Chat GET] Fetching chat messages for bookingId: "${bookingId}"`);

    await connectToMongoDB();
    let messages = await ChatMessageModel.find({ booking_id: bookingId }).sort({ created_at: 1 }).lean();

    if (!messages || messages.length === 0) {
      const db = getDb();
      messages = db.chat_messages.filter(m => m.booking_id === bookingId) as any;
    }

    return NextResponse.json({ success: true, messages });
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

    const msgObj = {
      id: `msg_${Date.now()}`,
      booking_id: bookingId,
      sender_id: senderId || 'usr_customer_1',
      sender_role: senderRole || 'customer',
      sender_name: senderName || 'User',
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    // Save to MongoDB Atlas
    const mongoRes = await connectToMongoDB();
    if (mongoRes.success) {
      await ChatMessageModel.create(msgObj);
      console.log(`[API Chat POST] SUCCESS: Message saved to MongoDB Atlas.`);
    }

    // Save to local DB fallback
    const db = getDb();
    db.chat_messages.push(msgObj as any);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Message sent!', chatMessage: msgObj });
  } catch (error: any) {
    console.error('[API Chat POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
