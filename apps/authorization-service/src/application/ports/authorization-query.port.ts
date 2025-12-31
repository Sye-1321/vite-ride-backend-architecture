import { AccessCheckDto } from '../dto';

export interface AuthorizationQueryPort {
  canAccess(
    dto: AccessCheckDto,
  ): Promise<{ allowed: boolean }>;
}
