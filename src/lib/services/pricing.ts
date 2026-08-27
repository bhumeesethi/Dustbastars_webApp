import { CleaningCategory, CleaningType, ChargeModel, CleanerRatesMap } from '../db';

export interface PricingCalculationInput {
  cleaningCategory: CleaningCategory;
  cleaningType: CleaningType;
  bookingType: 'calendar_post' | 'direct_cleaner';
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  unitsCount: number; // hours or rooms
  cleanerRates?: CleanerRatesMap;
  customQuoteAmount?: number;
}

export interface PricingCalculationResult {
  chargeModel: ChargeModel;
  unitRate: number;
  baseTotal: number;
  isEmergency: boolean;
  isAfterhours: boolean;
  surgeMultiplier: number;
  surgeBonusAmount: number;
  finalTotalAmount: number;
  depositAmount: number; // 30%
  platformCommission: number;
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
    cleanerRates,
    customQuoteAmount = 0
  } = input;

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

  // Calculate Base Total
  const baseTotal = chargeModel === 'quote' ? customQuoteAmount : unitRate * Math.max(1, unitsCount);

  // Check Emergency (<4h for calendar post, <2h for direct cleaner booking)
  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
  const now = new Date();
  const diffInHours = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  const isEmergency = 
    (bookingType === 'calendar_post' && diffInHours > 0 && diffInHours <= 4) ||
    (bookingType === 'direct_cleaner' && diffInHours > 0 && diffInHours <= 2);

  // Check Afterhours (start time >= 20:00)
  const hourOfDay = parseInt(scheduledTime.split(':')[0] || '0', 10);
  const isAfterhours = hourOfDay >= 20;

  // Calculate Surge Multipliers (15% platform commission + 10% extra cleaner surge pay if emergency/afterhours)
  let platformCommissionPct = 0.125; // 12.5% standard
  let cleanerSurgeBonusPct = 0.0;

  if (isEmergency || isAfterhours) {
    platformCommissionPct = 0.15; // 15% emergency platform fee
    cleanerSurgeBonusPct = 0.10; // 10% extra surge money for cleaner
  }

  const surgeBonusAmount = Number((baseTotal * cleanerSurgeBonusPct).toFixed(2));
  const finalTotalAmount = Number((baseTotal + surgeBonusAmount).toFixed(2));

  // Deposit is 30% of final total amount
  const depositAmount = Number((finalTotalAmount * 0.30).toFixed(2));

  // Platform Commission & Cleaner Payout
  const platformCommission = Number((finalTotalAmount * platformCommissionPct).toFixed(2));
  const cleanerPayoutAmount = Number((finalTotalAmount - platformCommission).toFixed(2));

  return {
    chargeModel,
    unitRate,
    baseTotal,
    isEmergency,
    isAfterhours,
    surgeMultiplier: (isEmergency || isAfterhours) ? 1.10 : 1.0,
    surgeBonusAmount,
    finalTotalAmount,
    depositAmount,
    platformCommission,
    cleanerPayoutAmount,
    contractRequired
  };
}
