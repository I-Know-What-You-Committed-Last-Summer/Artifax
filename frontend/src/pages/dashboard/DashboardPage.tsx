// Layout and small UI components used on the dashboard page
import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

// Mock data used to populate the dashboard UI (stats, alerts, previews)
import {
  craftQueueItems,
  dashboardAlerts,
  dashboardStats,
  inventoryPreviewRows,
} from '../../data/mockDashboard';
import { getCurrentDateSAST } from '../../Date/dateUtils';

function DashboardPage() {
  // Combine dynamic date with concise in-file comments.
  // `getCurrentDateSAST` produces a short date string for the header.
  const currentDate = getCurrentDateSAST();

  // Page shell: vertical spacing between main sections
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page header: title and subtitle */}
      <PageHeader title="Inventory & Crafting" subtitle={`Main Dashboard · ${currentDate}`} />

      {/* Alert strip showing any low-stock alerts */}
      <AlertStrip label="Low Stock:" items={dashboardAlerts} />

      {/* Small stat cards (e.g., totals, KPIs) rendered from mock data */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* Two-column area: inventory table + crafting queue */}
      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        {/* Inventory preview table */}
        <SectionCard title="Inventory" subtitle="24 items">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="font-outfit text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="dashboard-material-column pb-2 font-medium">Material</th>
                  <th className="qty-column pb-2 font-medium"><span className="qty-header">Qty</span></th>
                  <th className="dashboard-location-column pb-2 font-medium"><span className="location-header">Location</span></th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Each preview row maps to a sample inventory item */}
                {inventoryPreviewRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="dashboard-material-column py-2.5 font-medium text-text">{row.name}</td>
                    <td className="qty-column py-2.5 text-text"><span className="qty-value">{row.qty}</span></td>
                    <td className="dashboard-location-column py-2.5 text-muted"><span className="location-value">{row.location}</span></td>
                    <td className="py-2.5">
                      {/* Status badge shows OK/Low/etc. */}
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Crafting queue: shows items being crafted with progress */}
        <SectionCard title="Crafting Queue" subtitle="2 / 3">
          <div className="space-y-3">
            {craftQueueItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-app p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text">{item.name}</p>
                  {/* Status badge for craft item */}
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted">{item.location}</p>

                {/* Visual progress bar: inner width controlled by inline style */}
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
