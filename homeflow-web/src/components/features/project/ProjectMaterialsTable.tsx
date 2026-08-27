import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
import { MaterialResponse, ProjectMaterialResponse } from '@/lib/api/api.type';
import { formatCurrency } from './ProjectCard';
import WithdrawMaterialDialog from './WithdrawMaterialDialog';

const LOW_STOCK_THRESHOLD = 20;

type MaterialRow = {
  materialId: string;
  name: string;
  unit: string;
  imageUrl: string | null;
  price: string | null;
  stock: number | null;
  usedQty: number;
};

export default function ProjectMaterialsTable({
  projectId,
  materials,
  catalog,
  isManager
}: {
  projectId: string;
  materials: ProjectMaterialResponse[];
  catalog: MaterialResponse[];
  isManager: boolean;
}) {
  const usedQtyByMaterialId = new Map(
    materials.map((material) => [material.materialId, material.usedQty])
  );

  const rows: MaterialRow[] = isManager
    ? catalog.map((material) => ({
        materialId: material.id,
        name: material.name,
        unit: material.unit,
        imageUrl: material.imageUrl,
        price: material.price,
        stock: material.stock,
        usedQty: usedQtyByMaterialId.get(material.id) ?? 0
      }))
    : materials.map((material) => ({
        materialId: material.materialId,
        name: material.materialName,
        unit: material.unit,
        imageUrl: material.imageUrl,
        price: null,
        stock: null,
        usedQty: material.usedQty
      }));

  if (rows.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        {isManager
          ? 'ยังไม่มีวัสดุในคลัง'
          : 'ยังไม่มีวัสดุที่ใช้ในโครงการนี้'}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium" />
            <th className="px-4 py-3 font-medium">วัสดุ</th>
            <th className="px-4 py-3 font-medium">เบิกไปแล้ว (โครงการนี้)</th>
            {isManager && (
              <th className="px-4 py-3 font-medium">ราคา/หน่วย</th>
            )}
            {isManager && (
              <th className="px-4 py-3 font-medium">คงเหลือในคลัง</th>
            )}
            {isManager && <th className="px-4 py-3 font-medium" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const lowStock = row.stock !== null && row.stock <= LOW_STOCK_THRESHOLD;

            return (
              <tr
                key={row.materialId}
                className="border-t border-border last:border-b-0"
              >
                <td className="px-4 py-3">
                  <ImageWithPlaceholder
                    src={row.imageUrl}
                    alt={row.name}
                    className="size-20 shrink-0 rounded-md border border-border"
                  />
                </td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">
                  {row.usedQty} {row.unit}
                </td>
                {isManager && (
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatCurrency(row.price!)}
                  </td>
                )}
                {isManager && (
                  <td className="px-4 py-3">
                    <span
                      className={
                        lowStock
                          ? 'text-xs font-semibold text-destructive'
                          : ''
                      }
                    >
                      {row.stock} {row.unit}
                    </span>
                  </td>
                )}
                {isManager && (
                  <td className="px-4 py-3 text-right">
                    <WithdrawMaterialDialog
                      projectId={projectId}
                      materialId={row.materialId}
                      materialName={row.name}
                      unit={row.unit}
                      stock={row.stock!}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
