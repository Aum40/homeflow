import { EmptyToNull } from '@/common/decorators/empty-to-null.decorator';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator';

export class UpdateCompanyContactDto {
  @IsOptional()
  @EmptyToNull()
  @IsString()
  companyName?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  address?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsLatitude()
  latitude?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsLongitude()
  longitude?: number | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  businessHours?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  lineId?: string | null;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  facebook?: string | null;
}
