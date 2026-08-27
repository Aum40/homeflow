import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ReorderChecklistItemsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  itemIds: string[];
}
