import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { PropertyModel } from '@/lib/models';
import { getDb, saveDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || 'usr_customer_1';

    console.log(`[API Properties GET] Fetching properties for userId: "${userId}"`);

    await connectToMongoDB();
    let properties = await PropertyModel.find({ user_id: userId }).lean();

    if (!properties || properties.length === 0) {
      const db = getDb();
      properties = db.properties.filter(p => p.user_id === userId) as any;
    }

    return NextResponse.json({ success: true, properties });
  } catch (error: any) {
    console.error('[API Properties GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 'usr_customer_1', propertyType, name, otherDescription, bedroomsCount, bathroomsCount, sqftArea } = body;

    console.log(`[API Properties POST] Creating property "${name}" (${propertyType}) for user: ${userId}`);

    if (!name || !propertyType) {
      return NextResponse.json({ success: false, error: 'Property name and type are required.' }, { status: 400 });
    }

    if (propertyType === 'other' && !otherDescription) {
      return NextResponse.json({ success: false, error: 'Description is required when property type is Other.' }, { status: 400 });
    }

    const propId = `prop_${Date.now()}`;
    const newPropObj = {
      id: propId,
      user_id: userId,
      property_type: propertyType,
      name,
      other_description: otherDescription || undefined,
      address_id: 'addr_cust_1',
      bedrooms_count: bedroomsCount ? Number(bedroomsCount) : undefined,
      bathrooms_count: bathroomsCount ? Number(bathroomsCount) : undefined,
      sqft_area: sqftArea ? Number(sqftArea) : undefined,
      created_at: new Date().toISOString(),
    };

    // Save to MongoDB Atlas
    const mongoRes = await connectToMongoDB();
    if (mongoRes.success) {
      await PropertyModel.create(newPropObj);
      console.log(`[API Properties POST] SUCCESS: Property "${name}" saved to MongoDB Atlas.`);
    }

    // Save to local DB fallback
    const db = getDb();
    db.properties.push(newPropObj as any);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Property created successfully!', property: newPropObj });
  } catch (error: any) {
    console.error('[API Properties POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
