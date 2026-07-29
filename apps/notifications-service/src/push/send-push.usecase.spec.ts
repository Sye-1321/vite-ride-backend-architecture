import { ApplicationError } from '@app/application-core';

import { PushPort } from './push.port';
import { SendPushUseCase } from './send-push.usecase';

describe('SendPushUseCase', () => {
  let pushPort: jest.Mocked<PushPort>;
  let useCase: SendPushUseCase;

  beforeEach(() => {
    pushPort = {
      sendPush: jest.fn().mockResolvedValue({ deliveryId: 'delivery-2', outcome: 'accepted' }),
    };
    useCase = new SendPushUseCase(pushPort);
  });

  it('normalizes and de-duplicates device tokens', async () => {
    await useCase.execute({
      deviceTokens: [' device-a ', 'device-a', 'device-b'],
      title: ' Update ',
      body: ' Your trip changed ',
      data: { route: 'trip' },
    });

    expect(pushPort.sendPush).toHaveBeenCalledWith({
      tokens: ['device-a', 'device-b'],
      title: 'Update',
      body: 'Your trip changed',
      data: { route: 'trip' },
      correlationId: undefined,
    });
  });

  it('rejects a request without usable device tokens', () => {
    expect(() =>
      useCase.execute({
        deviceTokens: [' '],
        title: 'Update',
        body: 'Message',
      }),
    ).toThrow(ApplicationError);
    expect(pushPort.sendPush).not.toHaveBeenCalled();
  });

  it('rejects reserved keys and oversized payloads before provider handoff', () => {
    expect(() =>
      useCase.execute({
        deviceTokens: ['device-a'],
        title: 'Update',
        body: 'Message',
        data: { 'google.internal': 'value' },
      }),
    ).toThrow(ApplicationError);

    expect(() =>
      useCase.execute({
        deviceTokens: ['device-a'],
        title: 'Update',
        body: 'Message',
        data: { route: 'x'.repeat(4_096) },
      }),
    ).toThrow(ApplicationError);
    expect(pushPort.sendPush).not.toHaveBeenCalled();
  });
});
