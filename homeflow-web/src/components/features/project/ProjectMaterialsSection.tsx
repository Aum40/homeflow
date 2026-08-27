import {
  MaterialResponse,
  MaterialWithdrawalResponse,
  ProjectMaterialResponse
} from '@/lib/api/api.type';
import MaterialWithdrawalHistory from './MaterialWithdrawalHistory';
import ProjectMaterialsTable from './ProjectMaterialsTable';

export default function ProjectMaterialsSection({
  projectId,
  materials,
  catalog,
  withdrawals,
  isManager
}: {
  projectId: string;
  materials: ProjectMaterialResponse[];
  catalog: MaterialResponse[];
  withdrawals: MaterialWithdrawalResponse[];
  isManager: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-on-background">
          วัสดุที่ใช้ในโครงการ
        </h2>
        <ProjectMaterialsTable
          projectId={projectId}
          materials={materials}
          catalog={catalog}
          isManager={isManager}
        />
      </div>

      <MaterialWithdrawalHistory withdrawals={withdrawals} />
    </div>
  );
}
