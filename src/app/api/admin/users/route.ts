import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import { UserModel, CleanerProfileModel, PropertyModel, BookingModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (token) {
      const payload = verifyToken(token);
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Access denied: Admin role required.' }, { status: 403 });
      }
    }

    await connectToMongoDB();

    const search = searchParams.get('search')?.trim() || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'created_at_desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));

    const query: any = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { full_name: regex },
        { email: regex },
        { phone: regex },
        { id: regex }
      ];
    }

    if (role !== 'all') {
      query.role = role;
    }

    if (status !== 'all') {
      query.status = status;
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'created_at_asc') sortOptions = { createdAt: 1 };
    else if (sort === 'name_asc') sortOptions = { full_name: 1 };
    else if (sort === 'name_desc') sortOptions = { full_name: -1 };

    const totalUsers = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit) || 1;
    const skip = (page - 1) * limit;

    const users = await UserModel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Enrich users with cleaner profile & booking stats
    const enrichedUsers = await Promise.all(users.map(async (u: any) => {
      let cleanerProfile = null;
      let propertiesCount = 0;
      let bookingsCount = 0;

      if (u.role === 'cleaner') {
        cleanerProfile = await CleanerProfileModel.findOne({ user_id: u.id }).lean();
        bookingsCount = await BookingModel.countDocuments({ cleaner_id: u.id });
      } else if (u.role === 'customer') {
        propertiesCount = await PropertyModel.countDocuments({ user_id: u.id });
        bookingsCount = await BookingModel.countDocuments({ customer_id: u.id });
      }

      return {
        ...u,
        cleaner_profile: cleanerProfile,
        properties_count: propertiesCount,
        bookings_count: bookingsCount
      };
    }));

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit
      }
    });

  } catch (error: any) {
    console.error('[Admin Users API] Error listing users:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
