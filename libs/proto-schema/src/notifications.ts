export const NOTIFICATIONS_PACKAGE_NAME = 'notifications';
export const NOTIFICATIONS_SERVICE_NAME = 'NotificationsService';

export enum DeliveryStatus {
  DELIVERY_STATUS_UNSPECIFIED = 0,
  DELIVERY_STATUS_ACCEPTED = 1,
  DELIVERY_STATUS_DELIVERED = 2,
  DELIVERY_STATUS_FAILED = 3,
}

export type NotificationsEmpty = Record<string, never>;

export interface SendSmsRequest {
  recipient: string;
  message: string;
  correlationId: string;
}

export interface SendPushRequest {
  deviceTokens: string[];
  title: string;
  body: string;
  data: Record<string, string>;
  correlationId: string;
}

export interface DeliveryResponse {
  deliveryId: string;
  status: DeliveryStatus;
}

export interface NotificationsHealthResponse {
  status: string;
}

export interface NotificationsServiceClient {
  sendSms(request: SendSmsRequest): Observable<DeliveryResponse>;
  sendPush(request: SendPushRequest): Observable<DeliveryResponse>;
  health(request: NotificationsEmpty): Observable<NotificationsHealthResponse>;
}
import { Observable } from 'rxjs';
