import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMyProfileRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;
}
