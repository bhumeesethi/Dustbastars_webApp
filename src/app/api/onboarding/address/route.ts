import { NextResponse } from 'next/server';
import { validateAndAddAddress } from '@/lib/services/address';

export async function POST(req: Request) {
  try {
    const { userId, addressLine1, postcode, addressLine2 } = await req.json();
    if (!userId || !addressLine1 || !postcode) {
      return NextResponse.json({ success: false, message: 'userId, addressLine1, and postcode are required' }, { status: 400 });
    }
    const res = await validateAndAddAddress(userId, addressLine1, postcode, addressLine2);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
