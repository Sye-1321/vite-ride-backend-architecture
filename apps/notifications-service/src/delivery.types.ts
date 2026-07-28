export type DeliveryOutcome = 'accepted' | 'delivered';

export interface DeliveryResult {
  deliveryId: string;
  outcome: DeliveryOutcome;
}
