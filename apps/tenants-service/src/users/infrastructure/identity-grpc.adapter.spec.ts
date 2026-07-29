import { status } from '@grpc/grpc-js';
import { ClientGrpc } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

import { IdentityGrpcAdapter } from './identity-grpc.adapter';

describe('IdentityGrpcAdapter', () => {
  const getUserById = jest.fn();
  const client = {
    getService: jest.fn().mockReturnValue({ getUserById }),
  } as unknown as ClientGrpc;
  let adapter: IdentityGrpcAdapter;

  beforeEach(() => {
    getUserById.mockReset();
    adapter = new IdentityGrpcAdapter(client);
    adapter.onModuleInit();
  });

  it('accepts an existing user', async () => {
    getUserById.mockReturnValue(of({ id: 'user-1' }));

    await expect(adapter.assertExists('user-1')).resolves.toBeUndefined();
    expect(getUserById).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('maps a missing user to an invalid application reference', async () => {
    getUserById.mockReturnValue(throwError(() => ({ code: status.NOT_FOUND })));

    await expect(adapter.assertExists('missing')).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
  });
});
