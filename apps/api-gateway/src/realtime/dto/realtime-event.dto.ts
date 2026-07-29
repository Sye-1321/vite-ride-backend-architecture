import { IsISO8601, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class TenantSubscriptionDto {
  @IsUUID()
  tenantId: string;
}

export class DriverLocationDto extends TenantSubscriptionDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracyMeters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  headingDegrees?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  speedMetersPerSecond?: number;

  @IsISO8601({ strict: true })
  recordedAt: string;
}
