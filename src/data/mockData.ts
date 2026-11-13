import { RoomObject, Scenario, UserPriorities, SpatialAnnotation, DetectedBaselineObject } from '../types';

export const INITIAL_ROOM_OBJECTS: RoomObject[] = [
  {
    id: 'obj_door',
    name: 'Dark Walnut Carved Entry Door',
    category: 'architectural',
    surface: 'wall',
    yaw: 0,
    pitch: -2,
    dimensions: '88 × 205 cm',
    reversibility: 'low',
    description: 'Solid dark walnut wood entry door positioned in dead center of the North wall with carved molding, chrome handle, latch, and lock.',
    tags: ['Entry', 'Door', 'North Wall']
  },
  {
    id: 'obj_wardrobe',
    name: 'Flush Built-in Wall Wardrobe',
    category: 'storage',
    surface: 'wall',
    yaw: -32,
    pitch: 0,
    dimensions: '120 × 230 cm (Flush)',
    reversibility: 'low',
    description: 'Built-in wood wardrobe built flush directly into the North wall on the left side of the entry door.',
    tags: ['Storage', 'Wardrobe', 'North Wall']
  },
  {
    id: 'obj_door_switch',
    name: 'Entryway Modular Switchboard & Socket',
    category: 'architectural',
    surface: 'wall',
    yaw: 24,
    pitch: -2,
    dimensions: '20 × 11 cm',
    reversibility: 'low',
    description: 'Multi-gang modular switchboard plate (E) with lighting switches and 3-pin power socket on the North wall to the right of the door.',
    tags: ['Electrical', 'Switchboard', 'North Wall']
  },
  {
    id: 'obj_window_south_1',
    name: 'South Sliding Window 1 (under AC)',
    category: 'architectural',
    surface: 'wall',
    yaw: -155,
    pitch: 4,
    dimensions: '105 × 115 cm',
    reversibility: 'low',
    description: 'First sliding window on the South wall with aluminium frame, safety grill, marble windowsill, and dual curtains under the AC.',
    tags: ['Window', 'South Wall', 'Safety Grill']
  },
  {
    id: 'obj_window_south_2',
    name: 'South Sliding Window 2',
    category: 'architectural',
    surface: 'wall',
    yaw: 155,
    pitch: 4,
    dimensions: '105 × 115 cm',
    reversibility: 'low',
    description: 'Second sliding window on the South wall with aluminium frame, safety grill, marble windowsill, and dual curtains.',
    tags: ['Window', 'South Wall', 'Safety Grill']
  },
  {
    id: 'obj_split_ac',
    name: 'High-Wall Split Air Conditioner',
    category: 'architectural',
    surface: 'wall',
    yaw: -155,
    pitch: 28,
    dimensions: '85 × 28 × 20 cm',
    reversibility: 'low',
    description: 'Wall-mounted split AC unit mounted high on the South wall directly above Window 1.',
    tags: ['Appliance', 'Cooling', 'South Wall']
  },
  {
    id: 'obj_ac_starter',
    name: 'AC Power Starter Box & Conduit',
    category: 'architectural',
    surface: 'wall',
    yaw: -170,
    pitch: 30,
    dimensions: '13 × 15 cm',
    reversibility: 'low',
    description: 'Dedicated high-amperage AC power starter box with MCB switch, indicator LED, and ceiling conduit on South wall.',
    tags: ['Electrical', 'AC Point', 'South Wall']
  },
  {
    id: 'obj_wall_plug_points',
    name: 'South Wall Center Modular Switchboard (E)',
    category: 'architectural',
    surface: 'wall',
    yaw: 180,
    pitch: -18,
    dimensions: '24 × 11 cm',
    reversibility: 'low',
    description: 'Modular electrical switchboard & socket plate (E) situated in dead center between the two South wall windows.',
    tags: ['Electrical', 'Switchboard', 'South Wall']
  },
  {
    id: 'obj_tube_light',
    name: 'LED Batten Tube Light Fixture',
    category: 'lighting',
    surface: 'wall',
    yaw: 90,
    pitch: 26,
    dimensions: '120 × 4 × 4 cm',
    reversibility: 'low',
    description: 'Horizontal slimline LED tube light batten providing primary ambient warm-white illumination along the flat East wall.',
    tags: ['Lighting', 'LED Batten', 'East Wall']
  },
  {
    id: 'obj_ceiling_fan',
    name: 'Center 3-Blade Ceiling Fan',
    category: 'architectural',
    surface: 'ceiling',
    yaw: 0,
    pitch: 74,
    dimensions: '105 cm sweep',
    reversibility: 'low',
    description: 'Matte white ceiling fan with aerodynamic curved blades, downrod, and central motor canopy.',
    tags: ['Ceiling', 'Ventilation', 'Fan']
  },
  {
    id: 'obj_bed',
    name: 'Teak Wooden Bed',
    category: 'furniture',
    surface: 'floor',
    yaw: -115,
    pitch: -22,
    dimensions: '152 × 195 cm',
    reversibility: 'medium',
    description: 'Queen-size solid wood platform bed along West wall with carved headboard against South window under AC.',
    tags: ['Bed', 'Resting', 'West Wall']
  },
  {
    id: 'obj_study_table',
    name: 'Study Desk',
    category: 'furniture',
    surface: 'floor',
    yaw: 48,
    pitch: -16,
    dimensions: '105 × 60 × 75 cm',
    reversibility: 'high',
    description: 'Dark workstation desk with laptop surface and lower computer tower shelf positioned along East wall.',
    tags: ['Workstation', 'Desk', 'East Wall']
  },
  {
    id: 'obj_chair',
    name: 'Study Desk Chair',
    category: 'furniture',
    surface: 'floor',
    yaw: 44,
    pitch: -24,
    dimensions: '50 × 50 × 80 cm',
    reversibility: 'high',
    description: 'Molded plastic armchair with woven textured back positioned in front of study desk.',
    tags: ['Chair', 'Seating', 'East Wall']
  },
  {
    id: 'obj_side_table',
    name: 'Side Cabinet / Bookshelf',
    category: 'storage',
    surface: 'floor',
    yaw: 72,
    pitch: -14,
    dimensions: '45 × 45 × 56 cm',
    reversibility: 'high',
    description: 'Wooden multi-tier side cabinet with stacked reference books and binders along East wall.',
    tags: ['Side Table', 'Storage', 'East Wall']
  },
  {
    id: 'obj_dressing_table',
    name: 'Dressing Table & Mirror',
    category: 'furniture',
    surface: 'floor',
    yaw: 88,
    pitch: -2,
    dimensions: '75 × 42 × 165 cm',
    reversibility: 'medium',
    description: 'Wooden vanity dressing console with tall vertical mirror and cosmetic bottles along East wall.',
    tags: ['Vanity', 'Mirror', 'East Wall']
  },
  {
    id: 'obj_dressing_stool',
    name: 'Vanity Stool',
    category: 'furniture',
    surface: 'floor',
    yaw: 84,
    pitch: -25,
    dimensions: '32 × 32 × 40 cm',
    reversibility: 'high',
    description: 'Compact beige square plastic seating stool positioned in front of dressing table.',
    tags: ['Stool', 'Seating', 'East Wall']
  },
  {
    id: 'obj_laundry',
    name: 'Laundry Hamper',
    category: 'storage',
    surface: 'floor',
    yaw: 118,
    pitch: -18,
    dimensions: '38 × 38 × 60 cm',
    reversibility: 'high',
    description: 'Tall ventilated plastic mesh laundry hamper basket in South-East corner.',
    tags: ['Laundry', 'Storage', 'South-East Corner']
  },
  {
    id: 'obj_clutter',
    name: 'Storage Boxes & Clutter',
    category: 'storage',
    surface: 'floor',
    yaw: 142,
    pitch: -24,
    dimensions: '68 × 52 × 48 cm',
    reversibility: 'high',
    description: 'Stacked cardboard delivery boxes, low utility stool, extension power strip & phone chargers in front of South Window 2.',
    tags: ['Clutter', 'Boxes', 'South Wall']
  },
  {
    id: 'obj_pedestal_fan',
    name: 'Pedestal Floor Fan',
    category: 'furniture',
    surface: 'floor',
    yaw: -142,
    pitch: -12,
    dimensions: '42 × 42 × 120 cm',
    reversibility: 'high',
    description: 'High-speed 3-blade oscillating floor fan positioned near bed headboard and South Window 1.',
    tags: ['Fan', 'Cooling', 'South Wall']
  },
  {
    id: 'obj_ceramic_tiles',
    name: 'Polished Ceramic Tile Flooring',
    category: 'architectural',
    surface: 'floor',
    yaw: 0,
    pitch: -54,
    dimensions: '340 × 340 cm',
    reversibility: 'low',
    description: 'Light cream polished ceramic floor tiles with fine grout seams and specular glossy sheen.',
  }
];

export const INITIAL_PRIORITIES: UserPriorities = {
  openFloor: 4,
  workFocus: 5,
  visualCalm: 4,
  storage: 3,
  hosting: 3,
  selfExpression: 4,
  easyAdaptability: 5,
  currentPainPoint: 'Moving one thing disrupts three other activities; physical rearranging is exhausting.',
  primaryRoutine: 'Daily remote work & focused study, transitioning to evening reading or weekend creative projects.'
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'scenario_multitasker',
    title: 'Accommodate: "I need my room to do more"',
    persona: 'The Adaptive Multitasker',
    personaQuote: '"My room has to keep up with everything I do without feeling choked."',
    startingState: 'Everyday functional room with bed, single monitor desk, and mixed storage.',
    trigger: 'Work from home increased + requires dedicated dual-screen & organized gear without sacrificing floor space.',
    problem: 'Adding equipment easily encroaches on walking pathways and creates visual clutter.',
    goal: 'Expand work capability while preserving bed position, natural daylight, and circulation.',
    suggestedPrompt: 'Make room for a dedicated dual-screen workstation without blocking walkway to bed.',
    alternatives: [
      {
        id: 'alt_work_focus',
        title: 'Focus Station & Pegboard Optimization',
        shortDescription: 'Dual display with vertical pegboard storage, preserving 90cm corridor.',
        roomModeId: 'work_mode',
        highlights: [
          'Vertical wall utilization frees 0.6 m² desktop space',
          'Preserves direct window daylight on workspace',
          'Maintains clear 90cm entry walkway to bed'
        ],
        whatMoves: ['Ergonomic chair repositioned 15cm', 'Desk organizer migrated to wall pegboard'],
        whatStays: ['Platform bed remains unchanged', 'Window view completely unobstructed'],
        whatIsGained: ['Dual-screen ergonomic view', 'Organized cable tray', 'Dedicated task lighting'],
        whatIsCompromised: ['Wall hanging space above desk utilized', 'Slightly narrower chair roll-back margin'],
        prioritySupported: 'Work Focus & Visual Calm',
        effortLevel: 'Low',
        reversibility: 'Immediate',
        estimatedMinutes: 25,
        tradeOffs: [
          {
            id: 'to_1',
            type: 'gain',
            title: 'Vertical Storage Efficiency',
            description: 'Pegboard moves pens, headphones, and notebooks off the desk surface, maintaining a calm visual horizon.',
            prioritySupported: 'Work Focus',
            yaw: 72,
            pitch: 2
          },
          {
            id: 'to_2',
            type: 'gain',
            title: 'Preserves Natural Light',
            description: 'Positioning remains parallel to daylight angle, eliminating monitor screen glare.',
            prioritySupported: 'Work Focus',
            yaw: 94,
            pitch: 8
          },
          {
            id: 'to_3',
            type: 'compromise',
            title: 'Chair Roll-Back Boundary',
            description: 'With dual setup, rolling chair back beyond 75cm approaches the central open floor line.',
            prioritySupported: 'Open Floor',
            yaw: 48,
            pitch: -24
          }
        ],
        feasibilityChecks: [
          {
            id: 'fc_1',
            label: 'Doorway to Bed Corridor',
            status: 'passed',
            detail: '88cm clearance maintained along entire ingress route from door to bed.',
            measurementGuide: 'Measure 80cm minimum between desk corner and opposite wall.'
          },
          {
            id: 'fc_2',
            label: 'Chair Pull-Out Zone',
            status: 'passed',
            detail: 'Full 72cm clearance to push chair back and stand comfortably without hitting obstacles.'
          },
          {
            id: 'fc_3',
            label: 'Power Outlet Proximity',
            status: 'passed',
            detail: 'Within 1.2m of dual wall socket; cable raceway avoids floor tripping hazards.'
          }
        ],
        implementationSteps: [
          { id: 'is_1', task: 'Clear current desk clutter into temporary basket', effortMinutes: 5, reversible: true },
          { id: 'is_2', task: 'Mount modular adhesive/clamp pegboard behind desk', effortMinutes: 12, reversible: true },
          { id: 'is_3', task: 'Set up secondary display monitor & route cables along underside track', effortMinutes: 8, reversible: true }
        ]
      },
      {
        id: 'alt_work_divider',
        title: 'Peninsula Room Divider Layout',
        shortDescription: 'Rotate desk perpendicular to create a psychological zone between bed and office.',
        roomModeId: 'work_mode',
        highlights: [
          'Defines strict boundary between sleep and productivity',
          'Back of monitor acts as a subtle room divider'
        ],
        whatMoves: ['Desk rotated 90° into the center of the room', 'Cables routed along floor cord protector'],
        whatStays: ['Bed and wall shelves'],
        whatIsGained: ['Clear mental separation between day and night'],
        whatIsCompromised: ['Reduces open floor space by 1.8 m²', 'Narrower walkway between bed and desk (68cm)'],
        prioritySupported: 'Work Focus',
        effortLevel: 'Medium',
        reversibility: 'Moderate',
        estimatedMinutes: 45,
        tradeOffs: [
          {
            id: 'to_div_1',
            type: 'gain',
            title: 'Distinct Zone Boundary',
            description: 'Physically turning your back to the bed during working hours aids concentration.',
            prioritySupported: 'Work Focus',
            yaw: 60,
            pitch: -8
          },
          {
            id: 'to_div_2',
            type: 'compromise',
            title: 'Significant Floor Loss',
            description: 'Divides the open center into two smaller pockets, making morning stretching tighter.',
            prioritySupported: 'Open Floor',
            yaw: 10,
            pitch: -32
          }
        ],
        feasibilityChecks: [
          {
            id: 'fc_div_1',
            label: 'Passage Clearance',
            status: 'warning',
            detail: 'Bed-to-desk gap drops to 68cm. Passable for one person, tight with luggage or laundry basket.',
            measurementGuide: 'Test walking through with a laundry basket.'
          }
        ],
        implementationSteps: [
          { id: 'is_d1', task: 'Unplug and turn desk 90 degrees', effortMinutes: 20, reversible: true },
          { id: 'is_d2', task: 'Install heavy-duty floor cable protector to prevent tripping', effortMinutes: 15, reversible: true }
        ]
      }
    ]
  },
  {
    id: 'scenario_curator',
    title: 'Personalise: "I want my room to feel more like me"',
    persona: 'The Space Curator',
    personaQuote: '"I know how I want my room to feel. I just need to make it work in my actual room."',
    startingState: 'Functioning space that feels sterile, clinical, and lacks personal warmth or evening mood.',
    trigger: 'Desire to introduce layered lighting, cozy reading nook, and meaningful decor without feeling cluttered.',
    problem: 'Inspiration images from Pinterest do not account for physical space constraints or daytime vs night use.',
    goal: 'Infuse emotional warmth, tactile textures, and ambient 2700K lighting while maintaining practical utility.',
    suggestedPrompt: 'Turn this corner into a cozy evening reading sanctuary with warm lighting and soft rug.',
    alternatives: [
      {
        id: 'alt_reading_sanctuary',
        title: 'Warm Evening Reading Sanctuary',
        shortDescription: 'Brass arc floor lamp (2700K), low lounge chair, wool runner rug, and botanical art.',
        roomModeId: 'reading_evening',
        highlights: [
          'Warm 2700K ambient illumination dramatically lowers evening stress',
          'Compact low armchair fits neatly within the unused alcove',
          'Soft natural wool rug anchors the nook without obstructing door swing'
        ],
        whatMoves: ['Plants reorganized on upper shelf', 'Storage bins tucked beneath bed platform'],
        whatStays: ['Work desk remains intact for tomorrow morning', 'Bed orientation untouched'],
        whatIsGained: ['Inviting reading sanctuary', 'Warm lighting layer', 'Dedicated rest retreat'],
        whatIsCompromised: ['Consumes 1.1 m² floor in the corner', 'Floor lamp base requires dedicated footprint'],
        prioritySupported: 'Visual Calm & Self-Expression',
        effortLevel: 'Low',
        reversibility: 'Immediate',
        estimatedMinutes: 20,
        tradeOffs: [
          {
            id: 'to_cur_1',
            type: 'gain',
            title: 'Atmospheric Warmth',
            description: 'Downward arc light produces focused reading pool without lighting up the entire room.',
            prioritySupported: 'Visual Calm',
            yaw: 44,
            pitch: 5
          },
          {
            id: 'to_cur_2',
            type: 'gain',
            title: 'Tactile Comfort',
            description: 'Upholstered seat and natural wool rug dampen sound reverberation in a compact studio.',
            prioritySupported: 'Self-Expression',
            yaw: 35,
            pitch: -18
          },
          {
            id: 'to_cur_3',
            type: 'compromise',
            title: 'Corner Shelf Access',
            description: 'Sitting in chair temporarily blocks direct reach to the bottom storage drawer.',
            prioritySupported: 'Storage',
            yaw: 18,
            pitch: -12
          }
        ],
        feasibilityChecks: [
          {
            id: 'fc_c1',
            label: 'Door Swing Arc Clearance',
            status: 'passed',
            detail: 'Rug edge terminates 15cm clear of the inward door swing radius.'
          },
          {
            id: 'fc_c2',
            label: 'Lamp Cord Safety',
            status: 'passed',
            detail: 'Plugs directly into baseboard outlet without crossing walking pathways.'
          }
        ],
        implementationSteps: [
          { id: 'is_c1', task: 'Lay down textured wool runner rug in corner', effortMinutes: 3, reversible: true },
          { id: 'is_c2', task: 'Position compact low lounge armchair against alcove', effortMinutes: 7, reversible: true },
          { id: 'is_c3', task: 'Assemble brass floor lamp with 2700K warm LED bulb', effortMinutes: 10, reversible: true }
        ]
      }
    ]
  },
  {
    id: 'scenario_evolving',
    title: 'Adapt: "My room worked before. It does not anymore"',
    persona: 'The Evolving Resident',
    personaQuote: '"The room worked for me before. My life just is not the same anymore."',
    startingState: 'Room organized for past routine that has accumulated temporary fixes and ad-hoc clutter.',
    trigger: 'Started new creative hobby (painting / drafting) + wants ability to host a friend on weekends.',
    problem: 'Full redesign feels daunting, but temporary piles make the room feel cramped and demotivating.',
    goal: 'Evolve the space with a modular mobile setup: keep bed and desk, add creative storage, ready for guests.',
    suggestedPrompt: 'Show an adaptive setup for creative art supplies that can also host a friend easily.',
    alternatives: [
      {
        id: 'alt_creative_adaptive',
        title: 'Mobile Creative Caddy & Foldaway Host Setup',
        shortDescription: '3-tier wooden trolley on wheels, wall display grid, and nesting guest stool.',
        roomModeId: 'creative_adaptive',
        highlights: [
          'Zero structural disruption: bed and workstation remain 100% stable',
          'Mobile supply caddy rolls next to desk when painting, tucks away when resting',
          'Foldaway guest stool provides second seat for hosting friends without clutter'
        ],
        whatMoves: ['Small storage crates relocated to mobile trolley', 'Art prints pinned to modular grid'],
        whatStays: ['Platform bed and mattress', 'Window desk and ergonomic chair', 'Core lighting fixtures'],
        whatIsGained: ['Instant creative mode in under 2 minutes', 'Hosting capacity for 2', 'Clean floor when done'],
        whatIsCompromised: ['Trolley requires 45 × 35 cm parking spot when not in active use'],
        prioritySupported: 'Easy Adaptability & Hosting',
        effortLevel: 'Low',
        reversibility: 'Immediate',
        estimatedMinutes: 30,
        tradeOffs: [
          {
            id: 'to_ev_1',
            type: 'gain',
            title: 'Dynamic Reconfigurability',
            description: 'Roll the trolley to the window during daylight painting sessions; wheel back to corner at night.',
            prioritySupported: 'Easy Adaptability',
            yaw: 42,
            pitch: -15
          },
          {
            id: 'to_ev_2',
            type: 'gain',
            title: 'Friendly Hosting Mode',
            description: 'Pull out the foldaway stool and clear floor area to host tea or a movie night with a friend.',
            prioritySupported: 'Hosting',
            yaw: 15,
            pitch: -28
          },
          {
            id: 'to_ev_3',
            type: 'consideration',
            title: 'Trolley Wheel Care',
            description: 'Soft rubber casters prevent scuffing the oak hardwood floors when gliding.',
            prioritySupported: 'Visual Calm',
            yaw: 45,
            pitch: -35
          }
        ],
        feasibilityChecks: [
          {
            id: 'fc_ev1',
            label: 'Caster Roll Smoothness',
            status: 'passed',
            detail: 'Oak floor has seamless transitions with no thick thresholds in rolling path.'
          },
          {
            id: 'fc_ev2',
            label: 'Daylight Reach on Easel/Desk',
            status: 'passed',
            detail: 'Direct morning and diffused afternoon natural lighting hits the workspace.'
          }
        ],
        implementationSteps: [
          { id: 'is_e1', task: 'Assemble 3-tier mobile wooden utility cart with locking wheels', effortMinutes: 15, reversible: true },
          { id: 'is_e2', task: 'Sort paints, brushes, and sketching tools into upper organizers', effortMinutes: 10, reversible: true },
          { id: 'is_e3', task: 'Hang lightweight art display wire grid using non-marking adhesive hooks', effortMinutes: 5, reversible: true }
        ]
      }
    ]
  }
];

export const INITIAL_ANNOTATIONS: SpatialAnnotation[] = [
  {
    id: 'note_1',
    yaw: 52,
    pitch: -18,
    author: 'Resident Note',
    text: 'Need to test with physical tape measure if this corner allows pulling out the low desk drawer.',
    category: 'physical_test',
    timestamp: 'Yesterday'
  },
  {
    id: 'note_2',
    yaw: 44,
    pitch: 8,
    author: 'Lighting Observation',
    text: 'Feels dramatically calmer at night under the 2700K floor lamp than the overhead ceiling bulb.',
    category: 'lighting_note',
    timestamp: '2 days ago'
  }
];

export const DETECTED_BASELINE_OBJECTS: DetectedBaselineObject[] = [
  {
    id: 'det_bed',
    name: 'Teak Wooden Bed',
    position: [-0.90, 0.42, 0.685],
    dimensions: [1.52, 0.85, 1.95],
    category: 'furniture',
    notes: 'Queen wooden platform bed along West wall with headboard under South AC window'
  },
  {
    id: 'det_wardrobe',
    name: 'Built-in Wardrobe',
    position: [-1.08, 1.15, -1.68],
    dimensions: [1.20, 2.30, 0.15],
    category: 'architectural',
    notes: 'Flush into North wall, left of door'
  },
  {
    id: 'det_table',
    name: 'Study Desk',
    position: [1.38, 0.38, -0.95],
    dimensions: [0.60, 0.75, 1.05],
    category: 'furniture',
    notes: 'Workstation desk with laptop and tower shelf along East wall'
  },
  {
    id: 'det_chair',
    name: 'Study Desk Chair',
    position: [0.88, 0.40, -0.95],
    dimensions: [0.50, 0.80, 0.50],
    category: 'furniture',
    notes: 'Molded plastic armchair positioned in front of study desk'
  },
  {
    id: 'det_sidetable',
    name: 'Side Cabinet / Bookshelf',
    position: [1.455, 0.28, -0.15],
    dimensions: [0.45, 0.56, 0.45],
    category: 'furniture',
    notes: 'Wooden multi-tier storage cabinet with reference books along East wall'
  },
  {
    id: 'det_dressing_table',
    name: 'Dressing Table & Mirror',
    position: [1.47, 0.38, 0.50],
    dimensions: [0.42, 1.65, 0.75],
    category: 'furniture',
    notes: 'Wooden vanity dressing console with tall vertical mirror along East wall'
  },
  {
    id: 'det_dressing_stool',
    name: 'Vanity Stool',
    position: [1.02, 0.20, 0.50],
    dimensions: [0.32, 0.40, 0.32],
    category: 'furniture',
    notes: 'Compact square plastic seating stool in front of dressing table'
  },
  {
    id: 'det_laundry',
    name: 'Laundry Hamper',
    position: [1.49, 0.30, 1.25],
    dimensions: [0.38, 0.60, 0.38],
    category: 'furniture',
    notes: 'Tall ventilated mesh laundry hamper in South-East corner'
  },
  {
    id: 'det_clutter',
    name: 'Storage Boxes & Clutter',
    position: [0.85, 0.24, 1.28],
    dimensions: [0.68, 0.48, 0.52],
    category: 'furniture',
    notes: 'Stacked cardboard boxes, utility stool & power strip in front of South Window 2'
  },
  {
    id: 'det_fan',
    name: 'Pedestal Floor Fan',
    position: [-0.22, 0.60, 1.42],
    dimensions: [0.42, 1.20, 0.42],
    category: 'fixture',
    notes: 'Oscillating floor fan near bed headboard and South Window 1'
  },
  {
    id: 'det_ac',
    name: 'Split AC Unit',
    position: [-0.92, 2.38, 1.56],
    dimensions: [0.85, 0.28, 0.20],
    category: 'fixture',
    notes: 'High wall mounted climate unit above South Window 1'
  },
  {
    id: 'det_door',
    name: 'Entry Door',
    position: [0, 1.025, -1.68],
    dimensions: [0.88, 2.05, 0.08],
    category: 'architectural',
    notes: 'Dead center of North wall'
  },
  {
    id: 'det_tubelight',
    name: 'Batten Tube Light',
    position: [1.67, 2.38, 0],
    dimensions: [0.04, 0.04, 1.2],
    category: 'fixture',
    notes: 'High wall mounted ambient lighting on East wall'
  }
];

