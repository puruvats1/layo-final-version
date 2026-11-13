import { computePlacement, ROOM_HALF } from './stagingProxy';
import type { MoveIntent } from './askGemini';

/*
 * Turns the AI's proposed move ("by the window, facing the door") into positions the staging system
 * understands. Pure maths, no React or THREE scene: it uses the same wall clamping and snapping a
 * dragged piece gets, so an AI-placed piece looks exactly like one the person dropped there.
 *
 * Room coordinates (metres): x runs west to east, z runs north to south, the room is ±ROOM_HALF.
 * The windows are on the south wall (z = +ROOM_HALF) at x = ±0.92; the door is on the north wall
 * (z = -ROOM_HALF) at x = 0, 0.88 wide. A piece's front points along +z when its rotation is 0.
 */

const WINDOW_XS = [-0.92, 0.92];
const DOOR_HALF_WIDTH = 0.44;
/** Keep clear of the door so it can still swing open */
const DOOR_CLEARANCE = 0.3;
const GAP = 0.08;
const BIG = 10; // "all the way to that wall": computePlacement clamps it flush

/** Where a piece is now. The viewer reads this from the drawn model (see ViewerApi.getPiece). */
export interface PieceState {
  /** The piece's origin, as stored for moves: [x, y, z] */
  origin: [number, number, number];
  rotationY: number;
  /** Its size [w, h, d] and where the centre of that box sits relative to the origin, unrotated */
  dims: [number, number, number];
  offset: [number, number, number];
}

export interface PlannedMove {
  position: [number, number, number];
  rotationY: number;
}

/** Same turn as the viewer's: where an offset measured on the unrotated piece lands once rotated */
const rotateOffset = (off: [number, number, number], rotY: number) => ({
  x: off[0] * Math.cos(rotY) + off[2] * Math.sin(rotY),
  z: -off[0] * Math.sin(rotY) + off[2] * Math.cos(rotY),
});

/** Rotation that points a piece's front from `from` towards `to` (front is +z at rotation 0) */
const facing = (from: { x: number; z: number }, to: { x: number; z: number }) => Math.atan2(to.x - from.x, to.z - from.z);

const nearest = (value: number, options: number[]) => options.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));

/**
 * Plans every selected piece. Several pieces going to the same wall are lined up along it instead of
 * stacked on top of each other. Pieces already where they should be are left out of the result.
 */
export const planMoves = (pieces: { id: string; state: PieceState }[], intent: MoveIntent): Record<string, PlannedMove> => {
  const out: Record<string, PlannedMove> = {};
  // How far along the wall the next piece starts, and which way we are running
  let run = 0;

  pieces.forEach(({ id, state }, index) => {
    const [w, , d] = state.dims;
    const ro0 = rotateOffset(state.offset, state.rotationY);
    const centre = { x: state.origin[0] + ro0.x, z: state.origin[2] + ro0.z };
    const half = Math.max(w, d) / 2;

    // 1. Aim for a spot (the wall side is clamped flush by computePlacement)
    let targetX = centre.x;
    let targetZ = centre.z;
    let alongX = true; // which axis pieces line up along when there are several
    switch (intent.place) {
      case 'near_window':
        targetX = nearest(centre.x, WINDOW_XS);
        targetZ = BIG;
        break;
      case 'near_door': {
        const side = centre.x >= 0 ? 1 : -1;
        targetX = side * (DOOR_HALF_WIDTH + DOOR_CLEARANCE + half);
        targetZ = -BIG;
        break;
      }
      case 'west_wall':
        targetX = -BIG;
        alongX = false;
        break;
      case 'east_wall':
        targetX = BIG;
        alongX = false;
        break;
      case 'north_wall':
        targetZ = -BIG;
        break;
      case 'south_wall':
        targetZ = BIG;
        break;
      case 'room_center':
        targetX = 0;
        targetZ = 0;
        break;
      case 'none':
        break;
    }

    // 2. Line several pieces up side by side
    if (index > 0 && intent.place !== 'none') {
      const step = half + GAP;
      run += step;
      if (alongX) targetX += run;
      else targetZ += run;
      run += half;
    } else if (index === 0) {
      run = half;
    }

    // 3. Which way it faces, judged from where it will stand (placement first, then turn, then settle)
    let rot = state.rotationY;
    const settle = (r: number) => computePlacement(targetX, targetZ, state.dims, r, '');
    let p = settle(rot);
    switch (intent.face) {
      case 'window':
        rot = facing(p, { x: nearest(p.x, WINDOW_XS), z: ROOM_HALF });
        break;
      case 'door':
        rot = facing(p, { x: 0, z: -ROOM_HALF });
        break;
      case 'room_center':
        rot = facing(p, { x: 0, z: 0 });
        break;
      case 'keep':
        break;
    }
    // Furniture in a square room turns in quarter turns, not at odd diagonals
    if (intent.face !== 'keep') {
      const quarter = Math.PI / 2;
      rot = Math.round(rot / quarter) * quarter;
      if (rot > Math.PI + 1e-9) rot -= 2 * Math.PI;
      if (rot <= -Math.PI - 1e-9) rot += 2 * Math.PI;
    }
    p = settle(rot);

    // 4. Back from the box centre to the piece's origin
    const ro = rotateOffset(state.offset, rot);
    const position: [number, number, number] = [p.x - ro.x, state.origin[1], p.z - ro.z];

    const barelyMoved = Math.hypot(position[0] - state.origin[0], position[2] - state.origin[2]) < 0.03;
    const turned = Math.abs(Math.atan2(Math.sin(rot - state.rotationY), Math.cos(rot - state.rotationY))) > 0.05;
    if (!barelyMoved || turned) out[id] = { position, rotationY: rot };
  });

  return out;
};
