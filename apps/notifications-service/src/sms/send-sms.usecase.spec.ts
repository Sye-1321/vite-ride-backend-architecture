import { ApplicationError } from '@app/application-core';

import { SmsPort } from './sms.port';
import { SendSmsUseCase } from './send-sms.usecase';

describe('SendSmsUseCase', () => {
  let smsPort: jest.Mocked<SmsPort>;
  let useCase: SendSmsUseCase;

  beforeEach(() => {
    smsPort = {
      sendSms: jest.fn().mockResolvedValue({ deliveryId: 'delivery-1', outcome: 'accepted' }),
    };
    useCase = new SendSmsUseCase(smsPort);
  });

  it('normalizes input and delegates delivery through the port', async () => {
    await expect(
      useCase.execute({
        recipient: ' +251900000000 ',
        message: ' Verification code ',
        correlationId: 'request-1',
      }),
    ).resolves.toEqual({
      deliveryId: 'delivery-1',
      outcome: 'accepted',
    });

    expect(smsPort.sendSms).toHaveBeenCalledWith({
      to: '+251900000000',
      message: 'Verification code',
      correlationId: 'request-1',
    });
  });

  it('rejects an empty recipient before calling a provider', () => {
    expect(() => useCase.execute({ recipient: ' ', message: 'message' })).toThrow(ApplicationError);
    expect(smsPort.sendSms).not.toHaveBeenCalled();
  });
});
