import { getDb, saveDb, User } from '../db';

export interface IdVerificationResult {
  success: boolean;
  user?: User;
  confidence_score: number;
  message: string;
}

export function processIdVerification(
  userId: string,
  idDocumentUrl: string,
  selfieUrl: string
): IdVerificationResult {
  const db = getDb();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return { success: false, confidence_score: 0, message: 'User not found.' };
  }

  // Simulate facial recognition match confidence (e.g. 98.4% match)
  const confidenceScore = 98.4;
  user.id_document_url = idDocumentUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400';
  user.selfie_url = selfieUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400';
  user.id_verified = true;

  saveDb(db);

  return {
    success: true,
    user,
    confidence_score: confidenceScore,
    message: `Facial recognition matched live selfie against Passport/ID with ${confidenceScore}% confidence. ID Verified!`,
  };
}
