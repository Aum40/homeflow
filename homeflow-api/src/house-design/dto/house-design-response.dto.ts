export class HouseDesignResponseDto {
  id: string;

  name: string;

  description: string | null;

  imageUrl: string | null;

  basePrice: string;

  steps: string[];

  createdAt: Date;

  updatedAt: Date;
}
