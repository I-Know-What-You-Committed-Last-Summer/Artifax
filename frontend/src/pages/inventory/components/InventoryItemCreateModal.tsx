import React, { useEffect, useState } from 'react';
import FilterSelect from '../../../components/common/FilterSelect';
import { InventoryCreatedItem, InventoryItemCreate } from '../../../services/inventoryApi';

type InventoryItemCreateModalProps = {
  open: boolean;
  saving: boolean;
  categoryOptions: string[];
  onClose: () => void;
  onCreate: (payload: InventoryItemCreate) => Promise<InventoryCreatedItem>;
};

function InventoryItemCreateModal({ open, saving, categoryOptions, onClose, onCreate }: InventoryItemCreateModalProps) {
  const [formValues, setFormValues] = useState<InventoryItemCreate>({
    itemName: '',
    itemCategory: '',
    productionTime: 0,
    price: null,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues({
      itemName: '',
      itemCategory: categoryOptions[0] ?? '',
      productionTime: 0,
      price: null,
    });
  }, [categoryOptions, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCreate(formValues);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--overlay-backdrop)' }}
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-label="Create inventory item"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Add item</p>
              <h3 className="mt-1 text-lg font-semibold text-text">Create inventory item</h3>
              <p className="mt-1 text-xs text-muted">Add a new item record. Ingredient setup can be added later.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg border border-border bg-app px-3 py-2 text-sm font-medium text-text transition hover:border-primary">
              Close
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-text">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Item name</span>
              <input
                value={formValues.itemName}
                onChange={(event) => setFormValues((current) => ({ ...current, itemName: event.target.value }))}
                className="w-full rounded-xl border border-border bg-app px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-text">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Category</span>
              <FilterSelect
                value={formValues.itemCategory}
                onChange={(value) => setFormValues((current) => ({ ...current, itemCategory: value }))}
                options={categoryOptions.map((option) => ({ value: option, label: option }))}
                ariaLabel="Select item category"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-text">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Production time</span>
              <input
                type="number"
                min={0}
                value={formValues.productionTime}
                onChange={(event) => setFormValues((current) => ({ ...current, productionTime: Number(event.target.value) }))}
                className="w-full rounded-xl border border-border bg-app px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-text">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Price (ZAR)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={formValues.price ?? ''}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setFormValues((current) => ({
                    ...current,
                    price: nextValue === '' ? null : Number(nextValue),
                  }));
                }}
                className="w-full rounded-xl border border-border bg-app px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr,1fr]">
            <div className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-muted">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Create-only flow</p>
              <p className="mt-1">This first pass creates the item record only.</p>
              <p>Ingredient setup can follow later.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:border-primary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
              style={{ color: 'var(--on-primary)' }}
            >
              {saving ? 'Saving...' : 'Create item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InventoryItemCreateModal;