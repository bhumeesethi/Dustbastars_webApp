import { NextResponse } from 'next/server';
import { sendOtp, verifyOtp } from '@/lib/services/auth';

export async function POST(req: Request) {
  try {
    const { phoneOrEmail } = await req.json();
    if (!phoneOrEmail) {
      return NextResponse.json({ success: false, message: 'Phone or email is required' }, { status: 400 });
    }
    const res = sendOtp(phoneOrEmail);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { phoneOrEmail, code, role } = await req.json();
    if (!phoneOrEmail || !code) {
      return NextResponse.json({ success: false, message: 'Phone/email and code are required' }, { status: 400 });
    }
    const res = verifyOtp(phoneOrEmail, code, role || 'customer');
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
