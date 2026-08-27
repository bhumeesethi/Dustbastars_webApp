import { NextResponse } from 'next/server';
import { processIdVerification } from '@/lib/services/idVerification';

export async function POST(req: Request) {
  try {
    const { userId, idDocumentUrl, selfieUrl } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }
    const res = processIdVerification(userId, idDocumentUrl, selfieUrl);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
