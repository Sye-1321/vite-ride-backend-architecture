import { extractBearerToken, extractSocketToken } from './extract-token.util';

describe('realtime token extraction', () => {
  it('requires a bearer scheme for authorization headers', () => {
    expect(extractBearerToken('Bearer access-token')).toBe('access-token');
    expect(extractBearerToken('access-token')).toBeNull();
  });

  it('prefers the Socket.IO auth payload', () => {
    expect(
      extractSocketToken({
        auth: { accessToken: 'socket-token' },
        headers: { authorization: 'Bearer header-token' },
      }),
    ).toBe('socket-token');
  });
});
