import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class WithdrawMaterialDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  qty: number;
}
