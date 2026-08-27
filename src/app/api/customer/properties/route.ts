import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Property, PropertyType } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'usr_customer_1';

  const db = getDb();
  const properties = db.properties.filter(p => p.user_id === userId);

  return NextResponse.json({ properties });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = 'usr_customer_1',
      propertyType,
      name,
      otherDescription,
      addressId = 'addr_cust_1',
      bedroomsCount,
      bathroomsCount,
      sqftArea
    } = body;

    if (!propertyType || !name) {
      return NextResponse.json({ error: 'Property type and name are required' }, { status: 400 });
    }

    if (propertyType === 'other' && (!otherDescription || otherDescription.trim() === '')) {
      return NextResponse.json({ error: 'Detailed description is required when property type is OTHER' }, { status: 400 });
    }

    const db = getDb();
    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      user_id: userId,
      property_type: propertyType as PropertyType,
      name,
      other_description: propertyType === 'other' ? otherDescription : undefined,
      address_id: addressId,
      bedrooms_count: bedroomsCount ? parseInt(bedroomsCount, 10) : undefined,
      bathrooms_count: bathroomsCount ? parseInt(bathroomsCount, 10) : undefined,
      sqft_area: sqftArea ? parseInt(sqftArea, 10) : undefined,
      created_at: new Date().toISOString()
    };

    db.properties.push(newProperty);
    saveDb(db);

    return NextResponse.json({ success: true, property: newProperty });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
