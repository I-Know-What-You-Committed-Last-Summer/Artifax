import { useEffect, useState } from 'react';
import { getInventoryItems } from '../../services/inventoryApi';
import { useNavigate } from 'react-router-dom';

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  location: string;
  status: string;
};

export default function AlertsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    if (!open) return;

    setLoading(true);
    getInventoryItems()
      .then((rows) => {
        if (!mounted) return;
        setItems(rows.filter((r) => r.status === 'LOW'));
      })
      .catch((err) => {
        console.error('Failed to load low-stock items', err);
        if (mounted) setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded-lg bg-surface p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Low Stock Items</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close alerts">Close</button>
        </div>

        <div className="mt-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted">Loading...</div>
          ) : items.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted">No low-stock items</div>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-auto">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-app/50 p-3">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-muted">{it.quantity} remaining · {it.location}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        // navigate to Inventory with lowStock filter and highlight
                        navigate(`/inventory?lowStock=1&highlight=${encodeURIComponent(it.id)}`);
                        onClose();
                      }}
                    >
                      View in Inventory
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
