import { NextResponse } from 'next/server';
import { requestUCheckDbsCheck, updateUCheckDbsStatus } from '@/lib/services/dbs';

export async function POST(req: Request) {
  try {
    const { cleanerUserId } = await req.json();
    if (!cleanerUserId) {
      return NextResponse.json({ success: false, message: 'cleanerUserId is required' }, { status: 400 });
    }
    const res = requestUCheckDbsCheck(cleanerUserId);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { cleanerUserId, status } = await req.json();
    if (!cleanerUserId || !status) {
      return NextResponse.json({ success: false, message: 'cleanerUserId and status are required' }, { status: 400 });
    }
    const res = updateUCheckDbsStatus(cleanerUserId, status);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
