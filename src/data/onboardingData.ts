import { MoodItem } from '../types';

/*
 * Scripted content for Home, Scan and the 5-step onboarding.
 * Everything here is written for the one sample room (see mockData.ts):
 * a compact rented bedroom with a teak bed on the west wall, a study desk,
 * a dressing table, a built-in wardrobe, two south windows and a split AC.
 */

export const SAMPLE_ROOM = {
  name: "Aarav's Room",
  zoneName: 'Desk corner',
  panoramaUrl: '/assets/reference_room_panorama.jpg',
  /** A zone is one slice of the same panorama (object-position across the 360° strip) */
  zonePhotoPosition: '64% 50%',
  objectCount: 16,
};

const PANO = '/assets/reference_room_panorama.jpg';

/** Zones are slices of the sample panorama; position is the CSS object/background-position. */
export const HOME_ZONES = [
  { id: 'zone_bed', name: 'Bed corner', imageUrl: PANO, position: '18% 50%' },
  { id: 'zone_desk', name: 'Study desk', imageUrl: PANO, position: '64% 50%' },
  { id: 'zone_dressing', name: 'Dressing table', imageUrl: PANO, position: '78% 50%' },
  { id: 'zone_entry', name: 'Entry & wardrobe', imageUrl: PANO, position: '44% 50%' },
];

/* ----- Material swatches (CSS backgrounds) used by presets and pins ----- */

const grain = (tone: string) => `repeating-linear-gradient(96deg, ${tone} 0 2px, transparent 2px 11px)`;
const weave = 'repeating-linear-gradient(0deg, rgba(0,0,0,.04) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.04) 0 1px, transparent 1px 3px)';

const SW = {
  oak: `${grain('rgba(110,62,24,.12)')}, linear-gradient(100deg, #CFA172, #B9864F 45%, #D3A97B)`,
  birch: `${grain('rgba(140,110,70,.08)')}, linear-gradient(100deg, #EAD9BD, #DCC59F 50%, #EFE1C8)`,
  walnut: `${grain('rgba(30,16,8,.18)')}, linear-gradient(100deg, #6E4A32, #5A3925 50%, #7A5238)`,
  ash: `${grain('rgba(90,80,60,.08)')}, linear-gradient(100deg, #D8CCB8, #C9BBA3 50%, #DDD2C0)`,
  linen: `${weave}, #ECE4D6`,
  wool: `${weave}, #CFCBC6`,
  paper: `${weave}, #F4F0E8`,
  rattan: 'repeating-linear-gradient(45deg, rgba(120,80,30,.22) 0 3px, transparent 3px 7px), repeating-linear-gradient(-45deg, rgba(120,80,30,.22) 0 3px, transparent 3px 7px), #D9B27C',
  terracotta: 'radial-gradient(120% 90% at 30% 20%, #D9876A, #B85A3C)',
  rust: 'radial-gradient(120% 90% at 30% 20%, #C9693F, #9A4524)',
  mustard: 'radial-gradient(120% 90% at 30% 20%, #E3B54F, #C0912B)',
  olive: 'radial-gradient(120% 90% at 30% 20%, #8E9461, #666B3E)',
  sage: 'radial-gradient(120% 90% at 30% 20%, #B8C6AE, #8FA285)',
  charcoal: 'radial-gradient(120% 90% at 30% 20%, #4A4B4F, #2C2D31)',
  stone: 'radial-gradient(120% 90% at 30% 20%, #B9B2A6, #948C80)',
  cream: 'radial-gradient(120% 90% at 30% 20%, #FBF4E6, #EFE3CB)',
  chalk: 'radial-gradient(120% 90% at 30% 20%, #FFFFFF, #EEEDEA)',
  sky: 'radial-gradient(120% 90% at 30% 20%, #A9D3F5, #6FA9DD)',
  sunny: 'radial-gradient(120% 90% at 30% 20%, #FFE07A, #F6C232)',
  coral: 'radial-gradient(120% 90% at 30% 20%, #FF9F8A, #F0705A)',
  plant: 'radial-gradient(40% 40% at 35% 40%, #8DB377, transparent 70%), radial-gradient(45% 45% at 65% 60%, #5E8C4C, transparent 70%), #3F6A35',
  warmLight: 'radial-gradient(60% 60% at 50% 40%, #FFE3A8, #E8A657 60%, #8A5A2E)',
};

/* ----- Step 1 · Presets: ready-made style boards ----- */

export interface MoodPreset {
  id: string;
  title: string;
  blurb: string;
  tiles: string[];
}

export const MOOD_PRESETS: MoodPreset[] = [
  { id: 'preset_warm_minimal', title: 'Warm Minimal', blurb: 'Oak, linen and one terracotta accent.', tiles: [SW.oak, SW.linen, SW.terracotta, SW.cream] },
  { id: 'preset_soft_nordic', title: 'Soft Nordic', blurb: 'Pale wood, white walls, a touch of sage.', tiles: [SW.birch, SW.chalk, SW.sage, SW.wool] },
  { id: 'preset_cozy_boho', title: 'Cozy Boho', blurb: 'Rattan, layered textiles and warm rust.', tiles: [SW.rattan, SW.rust, SW.mustard, SW.olive] },
  { id: 'preset_calm_japandi', title: 'Calm Japandi', blurb: 'Low, quiet and earthy.', tiles: [SW.ash, SW.charcoal, SW.stone, SW.paper] },
  { id: 'preset_bright_dorm', title: 'Bright & Playful', blurb: 'Pops of colour for a lively room.', tiles: [SW.sky, SW.sunny, SW.coral, SW.chalk] },
];

/* ----- Step 1 · Gallery: photos already on the phone ----- */

export const GALLERY_PHOTOS: { id: string; title: string; url: string; position?: string }[] = [
  { id: 'gal_1', title: 'Bed & curtains', url: PANO, position: '16% 50%' },
  { id: 'gal_2', title: 'Fan by the window', url: '/assets/aistudio/43_0accd3ae.png' },
  { id: 'gal_3', title: 'Laundry corner', url: '/assets/aistudio/1_069c16e6.png' },
  { id: 'gal_4', title: 'Empty room', url: '/assets/aistudio/image_8_3eb7f66c.png' },
  { id: 'gal_5', title: 'Desk corner', url: PANO, position: '64% 50%' },
  { id: 'gal_6', title: 'Dressing table', url: PANO, position: '78% 50%' },
];

/* ----- Step 1 · Pinterest: a fake board the "link" resolves to ----- */

export const PINTEREST_BOARD = {
  title: 'Small room ideas',
  owner: 'aarav.designs',
  pins: [
    { id: 'pin_pegboard', title: 'Pegboard desk wall', tiles: [SW.birch, SW.chalk] },
    { id: 'pin_rattan', title: 'Rattan + linen corner', tiles: [SW.rattan, SW.linen] },
    { id: 'pin_plants', title: 'Plants on the sill', tiles: [SW.plant, SW.cream] },
    { id: 'pin_lights', title: 'Warm string lights', tiles: [SW.warmLight, SW.walnut] },
    { id: 'pin_divider', title: 'Sheer curtain divider', tiles: [SW.linen, SW.sage] },
    { id: 'pin_storage', title: 'Under-bed storage', tiles: [SW.oak, SW.wool] },
  ],
};

/** The style we pick for a room when the user adds no references (warm teak, daylight, compact). */
export const MATCHED_PRESET_ID = 'preset_warm_minimal';

export const presetToMoodItem = (p: MoodPreset): MoodItem => ({ id: p.id, source: 'preset', title: p.title, tiles: p.tiles });

/* ----- Step 3 · Describe the room ----- */

export const ROOM_TYPES = ['Bedroom', 'Dorm room', 'Studio', 'Shared room'];
export const DETECTED_ROOM_TYPE = 'Bedroom';

export const DEFAULT_DESCRIPTION =
  'A compact bedroom with a teak bed along the west wall, a study desk, a dressing table and a side cabinet. Two south windows bring in daylight. The wardrobe, door and AC stay where they are.';

/** Activity pills suggested from the room. Tapping one writes its sentence into the description. */
export const ACTIVITIES: { label: string; sentence: string }[] = [
  { label: 'Resting', sentence: 'I sleep and unwind here, so the bed corner should feel calm.' },
  { label: 'Studying', sentence: 'I study at the desk most evenings and want daylight and a plug point close by.' },
  { label: 'Working out', sentence: 'I do short workouts and need a clear patch of floor for a mat.' },
  { label: 'Getting ready', sentence: 'I get ready at the dressing table every morning.' },
  { label: 'Hosting friends', sentence: 'Friends come over sometimes, so I want room for two or three people to sit.' },
  { label: 'Art & hobbies', sentence: 'I sketch and paint, so I need a surface I can leave things out on.' },
  { label: 'Drying laundry', sentence: 'Laundry dries near the window, so that spot needs to stay free.' },
];

/* ----- Step 4 · What matters most ----- */

export const PRIORITY_SUGGESTIONS = [
  'Comfort',
  'Privacy',
  'Natural light',
  'Ventilation',
  'Open floor',
  'Storage',
  'Easy to clean',
  'Calm',
  'Plants',
];
export const DEFAULT_PRIORITIES = ['Comfort', 'Privacy', 'Natural light'];

/* ----- Step 5 · Processing ----- */

export const PROCESSING_STEPS = [
  'Making a clean base layer of the empty room',
  'Marking the door, windows and plug points',
  'Cutting out each piece of furniture',
  'Fitting the room box',
];
