import { Booking } from '../db';

export interface CancellationEvaluationInput {
  booking: Booking;
  cancelledBy: 'customer' | 'cleaner';
  cancellationTime?: Date;
}

export interface CancellationResult {
  isFreeCancellation: boolean;
  refundPercentage: number;
  refundAmount: number;
  penaltyFeeAmount: number;
  depositRetained: boolean;
  reassignmentRequired: boolean;
  explanation: string;
}

export function evaluateCancellationPolicy(input: CancellationEvaluationInput): CancellationResult {
  const { booking, cancelledBy, cancellationTime = new Date() } = input;

  const bookingCreatedAt = new Date(booking.created_at);
  const scheduledStart = new Date(`${booking.scheduled_date}T${booking.scheduled_start_time}:00`);

  const hoursSinceBooking = (cancellationTime.getTime() - bookingCreatedAt.getTime()) / (1000 * 60 * 60);
  const hoursUntilJobStart = (scheduledStart.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60);

  // Cleaner Cancellation
  if (cancelledBy === 'cleaner') {
    if (hoursUntilJobStart < 4) {
      // Cleaner cancelled less than 4 hours before cleaning -> System sends someone or full refund
      return {
        isFreeCancellation: true,
        refundPercentage: 100,
        refundAmount: booking.total_amount,
        penaltyFeeAmount: 0,
        depositRetained: false,
        reassignmentRequired: true,
        explanation: 'Cleaner cancelled within 4 hours of job start. System initiated emergency re-assignment or 100% full refund to customer.'
      };
    } else {
      return {
        isFreeCancellation: true,
        refundPercentage: 100,
        refundAmount: booking.total_amount,
        penaltyFeeAmount: 0,
        depositRetained: false,
        reassignmentRequired: true,
        explanation: 'Cleaner cancelled prior to 4 hours of job start. Customer fully refunded & job reposted.'
      };
    }
  }

  // Customer Cancellation
  // Rule: Emergency jobs cannot be refunded by default
  if (booking.is_emergency) {
    return {
      isFreeCancellation: false,
      refundPercentage: 0,
      refundAmount: 0,
      penaltyFeeAmount: booking.total_amount,
      depositRetained: true,
      reassignmentRequired: false,
      explanation: 'Emergency bookings are non-refundable by default.'
    };
  }

  // Rule 1: Cancellation within first 2 hours of booking creation is FREE
  if (hoursSinceBooking <= 2) {
    return {
      isFreeCancellation: true,
      refundPercentage: 100,
      refundAmount: booking.total_amount,
      penaltyFeeAmount: 0,
      depositRetained: false,
      reassignmentRequired: false,
      explanation: 'Cancelled within 2 hours of booking creation. 100% Full Refund issued.'
    };
  }

  // Rule 2: Cancellation in the last 6 hours before cleaning -> keep 100% full amount
  if (hoursUntilJobStart < 6) {
    return {
      isFreeCancellation: false,
      refundPercentage: 0,
      refundAmount: 0,
      penaltyFeeAmount: booking.total_amount,
      depositRetained: true,
      reassignmentRequired: false,
      explanation: 'Cancelled within 6 hours of job start time. 0% refund (100% full amount retained).'
    };
  }

  // Rule 3: Cancellation after 2 hours of booking creation, but >6 hours before cleaning -> keep 30% deposit
  const refundAmount = Number((booking.total_amount - booking.deposit_amount).toFixed(2));
  return {
    isFreeCancellation: false,
    refundPercentage: 70,
    refundAmount,
    penaltyFeeAmount: booking.deposit_amount,
    depositRetained: true,
    reassignmentRequired: false,
    explanation: 'Cancelled after 2 hours of booking creation. 30% deposit retained, 70% remaining balance refunded.'
  };
}
