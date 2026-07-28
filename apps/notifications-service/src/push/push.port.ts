import { DeliveryResult } from '../delivery.types';

export interface PushPort {
  /**
   * Send a push notification to one or more devices.
   *
   * @param tokens - Firebase device tokens
   * @param title - Notification title (short, user-facing)
   * @param body - Notification body (human-readable)
   * @param data - Optional key-value payload for app routing
   */
  sendPush(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    correlationId?: string;
  }): Promise<DeliveryResult>;
}
