import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class TenantsReadinessService {
  constructor(
    @InjectConnection('TenantsConnection')
    private readonly connection: Connection,
  ) {}

  status(): 'SERVING' | 'NOT_SERVING' {
    return this.connection.readyState === 1 ? 'SERVING' : 'NOT_SERVING';
  }
}
