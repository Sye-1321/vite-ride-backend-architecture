import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { ProtoMemberRole, ProtoTenantStatus } from '@app/proto-schema';

export class CreateTenantDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;
}

export class UpdateTenantDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;
}

export class ChangeTenantStatusDto {
  @IsEnum(ProtoTenantStatus)
  status: ProtoTenantStatus;
}

export class AddMemberDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  userId: string;

  @IsEnum(ProtoMemberRole)
  role: ProtoMemberRole;
}

export class RegisterDriverDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  userId: string;
}

export class TenantPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class ListTenantsDto extends TenantPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsEnum(ProtoTenantStatus)
  status?: ProtoTenantStatus;
}
