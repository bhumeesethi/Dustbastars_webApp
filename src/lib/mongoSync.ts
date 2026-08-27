import { connectToMongoDB } from './mongodb';
import { UserModel } from './models/User';
import { CleanerProfileModel } from './models/CleanerProfile';
import { PropertyModel } from './models/Property';
import { BookingModel } from './models/Booking';
import { ChatMessageModel } from './models/ChatMessage';
import { ReviewModel } from './models/Review';
import { CommercialContractModel } from './models/CommercialContract';
import { PaymentLogModel } from './models/PaymentLog';
import { INITIAL_DB } from './db';

export async function initMongoAndSeed() {
  const connected = await connectToMongoDB();
  if (!connected) return false;

  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB Seeder] Seeding initial data into MongoDB database...');
      await UserModel.insertMany(INITIAL_DB.users);
      await CleanerProfileModel.insertMany(INITIAL_DB.cleaner_profiles);
      await PropertyModel.insertMany(INITIAL_DB.properties);
      await BookingModel.insertMany(INITIAL_DB.bookings);
      await ChatMessageModel.insertMany(INITIAL_DB.chat_messages);
      await ReviewModel.insertMany(INITIAL_DB.reviews);
      console.log('[MongoDB Seeder] Initial database seed completed successfully!');
    }
    return true;
  } catch (error) {
    console.error('[MongoDB Seeder] Seeding error:', error);
    return false;
  }
}

export async function getMongoStats() {
  const connected = await connectToMongoDB();
  if (!connected) return { connected: false };

  try {
    const usersCount = await UserModel.countDocuments();
    const cleanerProfilesCount = await CleanerProfileModel.countDocuments();
    const propertiesCount = await PropertyModel.countDocuments();
    const bookingsCount = await BookingModel.countDocuments();
    const chatMessagesCount = await ChatMessageModel.countDocuments();
    const reviewsCount = await ReviewModel.countDocuments();
    const contractsCount = await CommercialContractModel.countDocuments();
    const paymentsCount = await PaymentLogModel.countDocuments();

    return {
      connected: true,
      stats: {
        users: usersCount,
        cleaner_profiles: cleanerProfilesCount,
        properties: propertiesCount,
        bookings: bookingsCount,
        chat_messages: chatMessagesCount,
        reviews: reviewsCount,
        commercial_contracts: contractsCount,
        payment_logs: paymentsCount
      }
    };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}
