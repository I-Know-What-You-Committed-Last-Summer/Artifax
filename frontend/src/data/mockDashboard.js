export const dashboardAlerts = [
  'Steel Rods (4 remaining)',
  'Copper Wire (2 remaining)',
];

export const dashboardStats = [
  { id: 'jobs', label: 'Total Jobs', value: 24 },
  { id: 'cancelled', label: 'Cancelled', value: 3 },
  { id: 'completed', label: 'Completed', value: '4,821' },
  { id: 'duration', label: 'Avg Duration', value: '6m' },
];

export const inventoryPreviewRows = [
  { id: 'met-001', name: 'Iron Ingot', qty: 142, location: 'Zone A-1', status: 'OK' },
  { id: 'tim-001', name: 'Timber Plank', qty: 88, location: 'Zone B-3', status: 'OK' },
  { id: 'met-002', name: 'Steel Rod', qty: 4, location: 'Zone A-2', status: 'LOW' },
  { id: 'rub-001', name: 'Rubber Seal', qty: 310, location: 'Zone C-1', status: 'OK' },
  { id: 'cop-001', name: 'Copper Wire', qty: 2, location: 'Zone D-2', status: 'LOW' },
  { id: 'fst-001', name: 'Bolt Set (M8)', qty: 520, location: 'Zone A-4', status: 'OK' },
  { id: 'met-003', name: 'Aluminum Sheet', qty: 67, location: 'Zone B-1', status: 'OK' },
  { id: 'pol-001', name: 'Plastic Casing', qty: 195, location: 'Zone C-3', status: 'OK' },
];

export const craftQueueItems = [
  {
    id: 'job-1',
    name: 'Gear Assembly x2',
    status: 'IN PROGRESS',
    progress: 65,
    eta: '~18 min remaining',
    location: 'Warehouse A',
  },
  {
    id: 'job-2',
    name: 'Frame Bracket x5',
    status: 'QUEUED',
    progress: 0,
    eta: '~45 min est.',
    location: 'Warehouse A',
  },
  {
    id: 'job-3',
    name: 'Frame Bracket x5',
    status: 'QUEUED',
    progress: 0,
    eta: '~45 min est.',
    location: 'Warehouse A',
  },
];
