export const craftingData = [
  {
    id: "#8492",
    name: "Circuit Board A1",
    qty: 50,
    status: "In Progress",
    progress: 68,
    timeLeft: "~12 min left",
    materials: ["Bolt Set M8 x20", "Hex Nut M10 x20"],
    location: "Warehouse A",
    type: "electronics",
    icon: "unitIcon"
  },
  {
    id: "#8493",
    name: "Gear Assembly",
    qty: 12,
    status: "Paused",
    progress: 32,
    timeLeft: "Paused",
    materials: ["Steel Plate x4", "Lubricant (Low)"],
    location: "Warehouse A",
    type: "mechanical",
    icon: "unitIcon"
  },
  {
    id: "#8494",
    name: "Packaging Unit",
    qty: 200,
    status: "In Progress",
    progress: 89,
    timeLeft: "~4 min left",
    materials: ["Cardboard Sheet", "Tape Roll"],
    location: "Warehouse B",
    type: "logistics",
    icon: "unitIcon"
  },
  {
    id: "#8495",
    name: "Frame Bracket",
    qty: 5,
    status: "Queued",
    progress: 0,
    timeLeft: "~45 min est.",
    materials: ["Steel Plate x2"],
    location: "Warehouse A",
    type: "mechanical",
    icon: "unitIcon"
  },
  {
    id: "#8496",
    name: "Motor Housing",
    qty: 18,
    status: "Queued",
    progress: 0,
    timeLeft: "~1 hr est.",
    materials: ["Aluminum Cast x2", "Sealant"],
    location: "Warehouse B",
    type: "mechanical",
    icon: "unitIcon"
  },
  {
    id: "#8497",
    name: "Control Panel",
    qty: 30,
    status: "Queued",
    progress: 0,
    timeLeft: "~30 min est.",
    materials: ["Switch Set", "Housing Plate"],
    location: "Warehouse A",
    type: "electronics",
    icon: "unitIcon"
  }
];

export const blueprintData = [
  {
    id: 'bp-101',
    name: 'Round Table',
    description: 'Assembled wood and steel furniture.',
    category: 'furniture',
    have: 20,
    craft: 520,
    materials: [
      { name: 'Iron Ingot', need: 10, have: 142 },
      { name: 'Bolt Set (M8)', need: 20, have: 520 },
      { name: 'Steel Rod', need: 8, have: 4 }
    ]
  },
  {
    id: 'bp-102',
    name: 'Hammer',
    description: 'Durable forging tool for workshops.',
    category: 'mechanical',
    have: 10,
    craft: 142,
    materials: [
      { name: 'Iron Ingot', need: 6, have: 142 },
      { name: 'Wood Handle', need: 2, have: 22 }
    ]
  },
  {
    id: 'bp-103',
    name: 'A4 Sketch book',
    description: 'Standard sketch book for planning.',
    category: 'electronics',
    have: 10,
    craft: 142,
    materials: [
      { name: 'Paper Stack', need: 12, have: 120 },
      { name: 'Glue Tube', need: 1, have: 14 }
    ]
  },
  {
    id: 'bp-104',
    name: 'Corbet',
    description: 'Precision mounting bracket.',
    category: 'mechanical',
    have: 8,
    craft: 0,
    materials: [
      { name: 'Steel Plate', need: 4, have: 8 },
      { name: 'Rivet Set', need: 12, have: 32 }
    ]
  },
  {
    id: 'bp-105',
    name: 'Table',
    description: 'Large assembly table with reinforced legs.',
    category: 'furniture',
    have: 20,
    craft: 520,
    materials: [
      { name: 'Plywood Panel', need: 6, have: 46 },
      { name: 'Steel Rod', need: 10, have: 4 }
    ]
  },
  {
    id: 'bp-106',
    name: 'A3 Sketch book',
    description: 'Oversized sketch book for large-format plans.',
    category: 'electronics',
    have: 20,
    craft: 520,
    materials: [
      { name: 'Paper Stack', need: 20, have: 160 },
      { name: 'Glue Tube', need: 1, have: 14 }
    ]
  },
  {
    id: 'bp-107',
    name: 'Workbench',
    description: 'Heavy-duty work surface with storage.',
    category: 'mechanical',
    have: 4,
    craft: 0,
    materials: [
      { name: 'Steel Rod', need: 12, have: 4 },
      { name: 'Bolt Set (M8)', need: 30, have: 520 }
    ]
  },
  {
    id: 'bp-108',
    name: 'Storage Bin',
    description: 'Stackable storage bin for components.',
    category: 'furniture',
    have: 12,
    craft: 142,
    materials: [
      { name: 'Plastic Sheet', need: 6, have: 92 },
      { name: 'Rivet Set', need: 8, have: 32 }
    ]
  }
];