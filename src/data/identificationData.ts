export type IdentificationStep = 'constraints' | 'assets' | 'completed';

export interface IdentifiedConstraint {
  id: string;
  name: string;
  type: 'window' | 'door' | 'plug' | 'wardrobe' | 'ac' | 'lighting';
  position: [number, number, number];
  dimensions: [number, number, number];
  description: string;
  specs: string;
  canReposition: boolean;
  canEditSpecs: boolean;
  configOptions: string[];
  currentConfig?: string;
}

export interface IdentifiedAsset {
  id: string;
  name: string;
  category: string;
  position: [number, number, number];
  dimensions: [number, number, number];
  description: string;
}

export const IDENTIFIED_CONSTRAINTS: IdentifiedConstraint[] = [
  {
    id: 'obj_window_south_1',
    name: 'Window',
    type: 'window',
    position: [-0.92, 1.25, 1.68],
    dimensions: [1.05, 1.15, 0.15],
    description: 'South Sliding Window 1 (under AC)',
    specs: '1.05 × 1.15m',
    canReposition: false,
    canEditSpecs: true,
    configOptions: ['Double Glazed + Curtain', 'Clear Float + Grille', 'Frosted Privacy Glass'],
    currentConfig: 'Double Glazed + Curtain'
  },
  {
    id: 'obj_window_south_2',
    name: 'Window',
    type: 'window',
    position: [0.92, 1.25, 1.68],
    dimensions: [1.05, 1.15, 0.15],
    description: 'South Sliding Window 2',
    specs: '1.05 × 1.15m',
    canReposition: false,
    canEditSpecs: true,
    configOptions: ['Double Glazed + Curtain', 'Clear Float + Grille', 'Sheer Daytime Curtains'],
    currentConfig: 'Double Glazed + Curtain'
  },
  {
    id: 'obj_wall_plug_points',
    name: 'Plug Point',
    type: 'plug',
    position: [0.0, 0.95, 1.68],
    dimensions: [0.24, 0.11, 0.05],
    description: 'South Wall Center Modular Switchboard & Plugs',
    specs: 'Modular Sockets',
    canReposition: true,
    canEditSpecs: true,
    configOptions: ['3 Switches + 16A Socket', 'Dual 16A Power Sockets', '2 Sockets + USB-C PD Fast Charge'],
    currentConfig: '3 Switches + 16A Socket'
  },
  {
    id: 'obj_door_switch',
    name: 'Plug Point',
    type: 'plug',
    position: [0.58, 1.15, -1.68],
    dimensions: [0.20, 0.11, 0.05],
    description: 'Entryway Modular Switchboard & Socket',
    specs: 'Switchboard & Socket',
    canReposition: true,
    canEditSpecs: true,
    configOptions: ['Master Lighting + 6A Socket', 'Smart Touch Dimmer Panel', 'Dual 6A Sockets'],
    currentConfig: 'Master Lighting + 6A Socket'
  },
  {
    id: 'obj_door',
    name: 'Door',
    type: 'door',
    position: [0.0, 1.025, -1.68],
    dimensions: [0.88, 2.05, 0.08],
    description: 'Dark Walnut Carved Entry Door',
    specs: '0.88 × 2.05m',
    canReposition: false,
    canEditSpecs: true,
    configOptions: ['Inward Right Swing', 'Inward Left Swing', 'Sliding Pocket Door'],
    currentConfig: 'Inward Right Swing'
  },
  {
    id: 'obj_wardrobe',
    name: 'Wardrobe',
    type: 'wardrobe',
    position: [-1.08, 1.15, -1.68],
    dimensions: [1.20, 2.30, 0.15],
    description: 'Flush Built-in Wall Wardrobe',
    specs: '1.20 × 2.30m (Flush)',
    canReposition: false,
    canEditSpecs: true,
    configOptions: ['2-Panel Sliding (Laminate)', 'Mirrored Sliding Panels', 'Louvered Bi-fold'],
    currentConfig: '2-Panel Sliding (Laminate)'
  },
  {
    id: 'obj_split_ac',
    name: 'AC Unit',
    type: 'ac',
    position: [-0.92, 2.38, 1.56],
    dimensions: [0.85, 0.28, 0.20],
    description: 'High-Wall Split Air Conditioner',
    specs: '1.5 Ton AC',
    canReposition: true,
    canEditSpecs: true,
    configOptions: ['1.5 Ton High Mount (Left)', '1.5 Ton Center Mount', 'Concealed Slim Duct'],
    currentConfig: '1.5 Ton High Mount (Left)'
  }
];

export const IDENTIFIED_MOVABLE_ASSETS: IdentifiedAsset[] = [
  {
    id: 'obj_bed',
    name: 'Bed',
    category: 'Resting & Sleeping',
    position: [-0.90, 0.42, 0.685],
    dimensions: [1.52, 0.85, 1.95],
    description: 'Queen-size teak wooden bed along West wall'
  },
  {
    id: 'obj_study_table',
    name: 'Desk',
    category: 'Work & Study',
    position: [1.38, 0.38, -0.95],
    dimensions: [0.60, 0.75, 1.05],
    description: 'Solid wood workstation desk along East wall'
  },
  {
    id: 'obj_chair',
    name: 'Chair',
    category: 'Seating & Posture',
    position: [0.88, 0.40, -0.95],
    dimensions: [0.50, 0.80, 0.50],
    description: 'Study desk chair'
  },
  {
    id: 'obj_side_table',
    name: 'Side Table',
    category: 'Storage & Access',
    position: [1.455, 0.28, -0.15],
    dimensions: [0.45, 0.56, 0.45],
    description: 'Side cabinet / bookshelf along East wall'
  },
  {
    id: 'obj_dressing_table',
    name: 'Dressing Table',
    category: 'Grooming & Vanity',
    position: [1.47, 0.38, 0.50],
    dimensions: [0.42, 1.65, 0.75],
    description: 'Dressing console with vertical mirror along East wall'
  },
  {
    id: 'obj_dressing_stool',
    name: 'Vanity Stool',
    category: 'Seating & Posture',
    position: [1.02, 0.20, 0.50],
    dimensions: [0.32, 0.40, 0.32],
    description: 'Compact square seating stool in front of dressing table'
  },
  {
    id: 'obj_laundry',
    name: 'Laundry',
    category: 'Utility & Storage',
    position: [1.49, 0.30, 1.25],
    dimensions: [0.38, 0.60, 0.38],
    description: 'Ventilated mesh laundry hamper in South-East corner'
  },
  {
    id: 'obj_clutter',
    name: 'Clutter',
    category: 'Storage & Miscellaneous',
    position: [0.85, 0.24, 1.28],
    dimensions: [0.68, 0.48, 0.52],
    description: 'Stacked boxes, utility stool and power cords in front of Window 2'
  },
  {
    id: 'obj_pedestal_fan',
    name: 'Fan',
    category: 'Cooling & Airflow',
    position: [-0.22, 0.60, 1.42],
    dimensions: [0.42, 1.20, 0.42],
    description: 'High-speed floor fan near bed headboard and Window 1'
  }
];
