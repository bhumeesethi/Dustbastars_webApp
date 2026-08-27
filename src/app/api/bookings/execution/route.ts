import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Review } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      action, // 'start_job' | 'finish_job' | 'upload_photos' | 'submit_review'
      role, // 'customer' | 'cleaner'
      beforePhotos,
      afterPhotos,
      rating,
      comment
    } = body;

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'bookingId and action are required' }, { status: 400 });
    }

    const db = getDb();
    const booking = db.bookings.find(b => b.id === bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const nowIso = new Date().toISOString();

    if (action === 'start_job') {
      if (role === 'customer') booking.customer_started_at = nowIso;
      if (role === 'cleaner') booking.cleaner_started_at = nowIso;

      // When either accepts start, status becomes in_progress
      booking.status = 'in_progress';
      saveDb(db);
      return NextResponse.json({ success: true, message: `${role} accepted job start`, booking });
    }

    if (action === 'finish_job') {
      if (role === 'customer') booking.customer_finished_at = nowIso;
      if (role === 'cleaner') booking.cleaner_finished_at = nowIso;

      // When both accept finish or cleaner submits completion, status becomes completed
      if (booking.cleaner_finished_at) {
        booking.status = 'completed';
      }
      saveDb(db);
      return NextResponse.json({ success: true, message: `${role} accepted job completion`, booking });
    }

    if (action === 'upload_photos') {
      if (beforePhotos && Array.isArray(beforePhotos)) {
        booking.before_photos = [...booking.before_photos, ...beforePhotos];
      }
      if (afterPhotos && Array.isArray(afterPhotos)) {
        booking.after_photos = [...booking.after_photos, ...afterPhotos];
      }
      saveDb(db);
      return NextResponse.json({ success: true, message: 'Photos updated successfully', booking });
    }

    if (action === 'delete_photo') {
      const { photoUrl, photoType } = body;
      if (!photoUrl || !photoType) {
        return NextResponse.json({ error: 'photoUrl and photoType are required' }, { status: 400 });
      }
      if (photoType === 'before') {
        booking.before_photos = booking.before_photos.filter(p => p !== photoUrl);
      } else if (photoType === 'after') {
        booking.after_photos = booking.after_photos.filter(p => p !== photoUrl);
      }
      saveDb(db);
      return NextResponse.json({ success: true, message: 'Photo removed successfully', booking });
    }

    if (action === 'submit_review') {
      if (!rating) {
        return NextResponse.json({ error: 'Rating (1-5) is required' }, { status: 400 });
      }

      const revieweeId = role === 'customer' ? booking.cleaner_id : booking.customer_id;
      const newReview: Review = {
        id: `rev_${Date.now()}`,
        booking_id: bookingId,
        reviewer_id: role === 'customer' ? booking.customer_id : (booking.cleaner_id || 'usr_cleaner_1'),
        reviewee_id: revieweeId || 'usr_cleaner_1',
        reviewer_role: role as 'customer' | 'cleaner',
        rating: parseInt(rating, 10),
        comment: comment || '',
        created_at: nowIso
      };

      db.reviews.push(newReview);

      // Recalculate average rating if reviewing cleaner
      if (role === 'customer' && booking.cleaner_id) {
        const cleanerProf = db.cleaner_profiles.find(p => p.user_id === booking.cleaner_id);
        if (cleanerProf) {
          const cleanerReviews = db.reviews.filter(r => r.reviewee_id === booking.cleaner_id);
          const totalRating = cleanerReviews.reduce((sum, r) => sum + r.rating, 0);
          cleanerProf.average_rating = Number((totalRating / cleanerReviews.length).toFixed(2));
          cleanerProf.total_completed_jobs += 1;
        }
      }

      saveDb(db);
      return NextResponse.json({ success: true, review: newReview, booking });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
