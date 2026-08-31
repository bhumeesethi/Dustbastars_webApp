import { CleaningCategory, CleaningType, ChargeModel, CleanerRatesMap } from '../db';

export interface PricingCalculationInput {
  cleaningCategory: CleaningCategory;
  cleaningType: CleaningType;
  bookingType: 'calendar_post' | 'direct_cleaner';
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  unitsCount: number; // hours or rooms
  cleanerCount?: number; // number of cleaners (default 1)
  cleanerRates?: CleanerRatesMap;
  customQuoteAmount?: number;
  isEmergencyOverride?: boolean;
}

export interface PricingCalculationResult {
  chargeModel: ChargeModel;
  unitRate: number;
  cleanerCount: number;
  baseTotal: number;
  isEmergency: boolean;
  isAfterhours: boolean;
  emergencySurchargeAmount: number; // £5/hr per cleaner
  surgeMultiplier: number;
  surgeBonusAmount: number;
  finalTotalAmount: number;
  depositAmount: number; // 100% upfront payment
  platformCommission: number; // 12.5% standard, 15% emergency
  cleanerPayoutAmount: number;
  contractRequired: boolean;
}

export function calculateBookingPrice(input: PricingCalculationInput): PricingCalculationResult {
  const {
    cleaningCategory,
    cleaningType,
    bookingType,
    scheduledDate,
    scheduledTime,
    unitsCount,
    cleanerCount = 1,
    cleanerRates,
    customQuoteAmount = 0,
    isEmergencyOverride
  } = input;

  const validCleanerCount = Math.max(1, cleanerCount || 1);

  // Determine contract warning for Commercial cleanings
  const contractRequired = cleaningCategory === 'commercial';

  // Determine Charge Model based on cleaning type spec
  let chargeModel: ChargeModel = 'per_hour';
  if (cleaningType === 'end_of_tenancy' || cleaningType === 'airbnb') {
    chargeModel = 'per_room';
  } else if (
    cleaningType === 'end_of_tenancy_removal' ||
    cleaningType === 'medical_clinical' ||
    cleaningType === 'events' ||
    cleaningType === 'other_specialized'
  ) {
    chargeModel = 'quote';
  }

  // Get unit rate from cleaner's rate card or default fallbacks
  let unitRate = 0;
  if (chargeModel === 'quote') {
    unitRate = customQuoteAmount;
  } else if (cleanerRates && cleanerRates[cleaningType]?.enabled) {
    unitRate = cleanerRates[cleaningType].amount;
  } else {
    // Fallback baseline defaults if no cleaner profile attached yet
    if (chargeModel === 'per_hour') unitRate = 18.00;
    if (chargeModel === 'per_room') unitRate = 30.00;
  }

  // Calculate Base Total for all cleaners combined
  const perCleanerBase = chargeModel === 'quote' ? customQuoteAmount : unitRate * Math.max(1, unitsCount);
  const baseTotal = Number((perCleanerBase * validCleanerCount).toFixed(2));

  // Check Emergency (<4h for calendar post, <2h for direct cleaner booking, or explicit override)
  let isEmergency = Boolean(isEmergencyOverride);
  if (!isEmergency && scheduledDate && scheduledTime) {
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    const now = new Date();
    const diffInHours = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    isEmergency = 
      (bookingType === 'calendar_post' && diffInHours > 0 && diffInHours <= 4) ||
      (bookingType === 'direct_cleaner' && diffInHours > 0 && diffInHours <= 2);
  }

  // Check Afterhours (start time >= 20:00)
  const hourOfDay = parseInt((scheduledTime || '14:00').split(':')[0] || '0', 10);
  const isAfterhours = hourOfDay >= 20;

  // Emergency Rule: £5 per hour surcharge per cleaner for emergency bookings
  const emergencySurchargeAmount = isEmergency 
    ? Number((5.00 * Math.max(1, unitsCount) * validCleanerCount).toFixed(2)) 
    : 0;

  // Commission Rule: 15% platform commission for emergency, 12.5% for standard (fee stays 12.5% for multi-cleaners standard)
  const platformCommissionPct = isEmergency ? 0.15 : 0.125;
  const cleanerSurgeBonusPct = (isEmergency || isAfterhours) ? 0.10 : 0.0;

  const surgeBonusAmount = Number((baseTotal * cleanerSurgeBonusPct).toFixed(2));
  const subtotalAmount = Number((baseTotal + emergencySurchargeAmount + surgeBonusAmount).toFixed(2));
  const platformCommission = Number((subtotalAmount * platformCommissionPct).toFixed(2));
  const finalTotalAmount = Number((subtotalAmount + platformCommission).toFixed(2));

  // Payment Rule: 100% Upfront Payment required prior to booking confirmation
  const depositAmount = finalTotalAmount;

  // Platform Commission & Cleaner Payout
  const cleanerPayoutAmount = Number((finalTotalAmount - platformCommission).toFixed(2));

  return {
    chargeModel,
    unitRate,
    cleanerCount: validCleanerCount,
    baseTotal,
    isEmergency,
    isAfterhours,
    emergencySurchargeAmount,
    surgeMultiplier: (isEmergency || isAfterhours) ? 1.10 : 1.0,
    surgeBonusAmount,
    finalTotalAmount,
    depositAmount,
    platformCommission,
    cleanerPayoutAmount,
    contractRequired
  };
}
