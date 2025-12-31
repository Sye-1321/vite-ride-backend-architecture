import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PushPort } from '../push.port';
import { FirebaseConfig } from './config/firebase.config.schema';

@Injectable()
export class FirebaseAdapter implements PushPort, OnModuleInit {
  private app: admin.app.App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const config = this.configService.get<FirebaseConfig>('firebase', {
      infer: true,
    });

    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.FIREBASE_PROJECT_ID,
        clientEmail: config.FIREBASE_CLIENT_EMAIL,
        privateKey: config.FIREBASE_PRIVATE_KEY,
      }),
    });

    console.log(this.app.name);
  }

  async sendPush(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    if (!params.tokens.length) return;

    await this.app.messaging().sendEachForMulticast({
      tokens: params.tokens,
      notification: {
        title: params.title,
        body: params.body,
      },
      data: params.data,
    });
  }
}
