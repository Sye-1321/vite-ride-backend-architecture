import { DeliveryResult } from '../delivery.types';

export interface SmsPort {
  /**
   * Send an SMS message to a phone number.
   *
   * @param to - Recipient phone number
   * @param message - Fully formatted message content to be delivered
   */
  sendSms(params: { to: string; message: string; correlationId?: string }): Promise<DeliveryResult>;
}
