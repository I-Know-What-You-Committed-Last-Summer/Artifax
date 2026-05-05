import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  craftQueueItems,
  dashboardAlerts,
  dashboardStats,
  inventoryPreviewRows,
} from '../../data/mockDashboard';

function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader title="Inventory & Crafting" subtitle="Main Dashboard · Today, 14 Jun 2025" />
      <AlertStrip label="Low Stock:" items={dashboardAlerts} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <SectionCard title="Inventory" subtitle="24 items">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="pb-2 font-medium">Material</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryPreviewRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="py-2.5 font-medium text-text">{row.name}</td>
                    <td className="py-2.5 text-text">{row.qty}</td>
                    <td className="py-2.5 text-muted">{row.location}</td>
                    <td className="py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Crafting Queue" subtitle="2 / 3">
          <div className="space-y-3">
            {craftQueueItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-app p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text">{item.name}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted">{item.location}</p>
                <div className="mt-2 h-2 rounded-full bg-border">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">{item.eta}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default DashboardPage;
