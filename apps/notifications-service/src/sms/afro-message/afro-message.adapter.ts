import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SmsPort } from '../sms.port';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AfroMessageConfig } from './config';

@Injectable()
export class AfroMessageAdapter implements SmsPort {
  private readonly afroConfig: AfroMessageConfig;
  private readonly baseUrl = 'https://api.afromessage.com/api/send';

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.afroConfig = this.configService.get<AfroMessageConfig>('afromessage', {
      infer: true,
    });
  }

  async sendSms(params: {
    to: string;
    message: string;
  }): Promise<void> {
    const payload = {
      to: params.to,
      message: params.message,
    };

    try {
      await firstValueFrom(
        this.http.post(this.baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.afroConfig.AFROMESSAGE_API_TOKEN}`,
          },
        }),
      );
    } catch (error: any) {
      throw new Error(
        `AfroMessage API Error: ${error.response?.status} - ${
          error.response?.data || error.message
        }`,
      );
    }
  }
}
