import { OnApplicationShutdown } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { App, cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

import { ApplicationError } from '@app/application-core';
import { LoggerPort } from '@app/shared-kernel';

import { NotificationsConfig } from '../../config';
import { DeliveryResult } from '../../delivery.types';
import { PushPort } from '../push.port';

export class FirebaseAdapter implements PushPort, OnApplicationShutdown {
  private readonly app: App;
  private readonly messaging: Messaging;

  constructor(
    config: NotificationsConfig,
    private readonly logger: LoggerPort,
    app?: App,
    messaging?: Messaging,
    private readonly deleteApplication: (app: App) => Promise<void> = deleteApp,
  ) {
    this.app =
      app ??
      initializeApp(
        {
          credential: cert({
            projectId: config.FIREBASE_PROJECT_ID!,
            clientEmail: config.FIREBASE_CLIENT_EMAIL!,
            privateKey: config.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
          }),
        },
        `notifications-${randomUUID()}`,
      );
    this.messaging = messaging ?? getMessaging(this.app);
  }

  async sendPush(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    correlationId?: string;
  }): Promise<DeliveryResult> {
    const deliveryId = randomUUID();
    try {
      const response = await this.messaging.sendEachForMulticast({
        tokens: params.tokens,
        notification: {
          title: params.title,
          body: params.body,
        },
        data: params.data,
      });

      if (response.successCount === 0) {
        throw new ApplicationError('UNAVAILABLE', 'Push provider rejected every recipient');
      }
      if (response.failureCount > 0) {
        this.logger.warn(
          'push provider partially accepted batch',
          {
            deliveryId,
            requestedCount: params.tokens.length,
            failureCount: response.failureCount,
          },
          FirebaseAdapter.name,
        );
      }
      return { deliveryId, outcome: 'accepted' };
    } catch (error) {
      this.logger.error('push provider request failed', error, FirebaseAdapter.name);
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError('UNAVAILABLE', 'Push provider is unavailable');
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.deleteApplication(this.app);
  }
}
