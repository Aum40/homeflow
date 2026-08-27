export class MaterialWithdrawalResponseDto {
  id: string;

  projectMaterialId: string;

  materialName: string;

  qty: number;

  unitPriceAtTime: string;

  withdrawnById: string;

  withdrawnByName: string;

  withdrawnAt: Date;
}
