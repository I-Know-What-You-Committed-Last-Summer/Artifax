// Layout and small UI components used on the dashboard page
import AlertStrip from '../../components/layout/AlertStrip';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

import { buildInventoryOverview, getInventoryItems, InventoryItem, DashboardPreviewRow } from '../../services/inventoryApi';
import { getActiveAndQueuedJobs, CraftingJob } from '../../services/orderApi';
import { useEffect, useMemo, useState, useRef } from 'react';
import { getCurrentDateSAST } from '../../Date/dateUtils';

function DashboardPage() {
  const currentDate = getCurrentDateSAST();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [activeJobs, setActiveJobs] = useState<CraftingJob[]>([]);
  const [queuedJobs, setQueuedJobs] = useState<CraftingJob[]>([]);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // load inventory once
    getInventoryItems()
      .then((rows) => {
        if (mounted) setInventoryItems(rows);
      })
      .catch((err) => {
        console.error('Failed to load dashboard inventory data', err);
        if (mounted) setInventoryItems([]);
      });

    // guarded job loader to avoid overlapping requests
    const loadJobs = async () => {
      if (!mounted) return;
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const { activeItems, queuedItems } = await getActiveAndQueuedJobs();
        if (!mounted) return;
        setActiveJobs(activeItems);
        setQueuedJobs(queuedItems);
      } catch (err) {
        console.error('Failed to load crafting jobs', err);
        if (mounted) {
          setActiveJobs([]);
          setQueuedJobs([]);
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    // initial load and interval
    loadJobs();
    intervalId = setInterval(loadJobs, 10000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const inventoryOverview = useMemo(() => buildInventoryOverview(inventoryItems), [inventoryItems]);

  const previewRows: DashboardPreviewRow[] = inventoryOverview.previewRows;

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader title="Inventory & Crafting" subtitle={`Main Dashboard · ${currentDate}`} />

      <AlertStrip label={`Low Stock: ${inventoryOverview.alerts.length}`} items={inventoryOverview.alerts} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {inventoryOverview.stats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <SectionCard title="Inventory" subtitle={`${inventoryItems.length} items`}>
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
                {previewRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="dashboard-material-column py-2.5 font-medium text-text">{row.name}</td>
                    <td className="qty-column py-2.5 text-text"><span className="qty-value">{row.qty}</span></td>
                    <td className="dashboard-location-column py-2.5 text-muted"><span className="location-value">{row.location}</span></td>
                    <td className="py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
                {previewRows.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-sm text-muted" colSpan={4}>
                      No live inventory rows available yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>

        
          <SectionCard title="Crafting Queue" subtitle="Live from Orders">
            <div className="space-y-3">
              <div>
                <h4 className="mb-2 text-sm font-medium">Active Jobs</h4>
                {activeJobs.length === 0 ? (
                  <div className="rounded-xl border border-border bg-app p-3 text-sm text-muted">No active jobs</div>
                ) : (
                  <div className="space-y-2">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="rounded-xl border border-border bg-app p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{job.name}</div>
                          <div className="text-sm text-muted">{job.timeLeft}</div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm text-muted">{job.location}</div>
                          <div className="text-sm">{job.qty} pcs</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Queued Jobs</h4>
                {queuedJobs.length === 0 ? (
                  <div className="rounded-xl border border-border bg-app p-3 text-sm text-muted">No queued jobs</div>
                ) : (
                  <div className="space-y-2">
                    {queuedJobs.map((job) => (
                      <div key={job.id} className="rounded-xl border border-border bg-app p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{job.name}</div>
                          <div className="text-sm text-muted">{job.timeLeft}</div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm text-muted">{job.location}</div>
                          <div className="text-sm">{job.qty} pcs</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
      </div>
    </div>
  );
}

export default DashboardPage;
