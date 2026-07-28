import { randomUUID } from 'crypto';
import * as admin from 'firebase-admin';

import { NotificationsConfig } from '../../config';
import { DeliveryResult } from '../../delivery.types';
import { PushPort } from '../push.port';

export class FirebaseAdapter implements PushPort {
  private readonly app: admin.app.App;

  constructor(config: NotificationsConfig) {
    this.app = admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId: config.FIREBASE_PROJECT_ID!,
          clientEmail: config.FIREBASE_CLIENT_EMAIL!,
          privateKey: config.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      },
      `notifications-${randomUUID()}`,
    );
  }

  async sendPush(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    correlationId?: string;
  }): Promise<DeliveryResult> {
    await this.app.messaging().sendEachForMulticast({
      tokens: params.tokens,
      notification: {
        title: params.title,
        body: params.body,
      },
      data: params.data,
    });

    return { deliveryId: randomUUID(), outcome: 'delivered' };
  }
}
