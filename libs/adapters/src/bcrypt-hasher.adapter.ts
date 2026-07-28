import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { HasherPort } from '@app/shared-kernel';

@Injectable()
export class BcryptHasher implements HasherPort {
  async hash(value: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(value, salt);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
