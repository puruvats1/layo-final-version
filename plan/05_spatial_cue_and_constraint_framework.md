# Step 05: Spatial Cue & Constraint Framework (SCPF)

[← Back to Step 04](./04_canvas_interaction_model.md) | [Back to Overview](./00_overview.md) | [Next: AI Vision Pipeline →](./06_ai_vision_pipeline.md)

---

## 1. Framework Purpose & Architectural Philosophy

Rather than treating spatial hints as isolated ad-hoc UI examples, the **Spatial Cue & Constraint Framework (SCPF)** provides a rigorous, unified system that governs how the application:
1. **Detects & Models** physical room realities (anchors, vectors, boundaries).
2. **Surfaces Whisper-Quiet In-Flight Cues** during touch drag without cluttering the 360 canvas.
3. **Translates Physical Placement into Natural Language Intent** upon drop.
4. **Compiles Calm, Non-Judgmental Trade-Offs** for the post-generation `💡 Room Insights` drawer.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SPATIAL CONSTRAINT LIFECYCLE                         │
│                                                                        │
│  [1. Detection] ──▶ [2. In-Flight Cue] ──▶ [3. Drop Snapping] ──▶ [4. Insight Rule]
│   Fixed Anchor       Subtle dynamic         Auto-calculated        Conversational
│   mapped by AI       cue during drag        prompt & chips         trade-off note
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Comprehensive Constraint Matrix

| Constraint Class | Physical Target | Detection Anchor | Proximity Threshold | In-Flight Visual Cue (While Dragging) | On-Drop Suggestive Orientation Pills (With Rationale) | Post-Generation Advisory Rule (`Room Insights`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **⚡ Electrical Access** | Wall power sockets, switchboards, multi-plugs | 2D Wall coordinate $(\theta, \phi)$ | Distance $d \le 3.0\text{m}$ to electrical items (desk, TV, nightstand, lamp) | **Elastic Distance Thread**: A subtle, semi-transparent dashed line connecting item base to socket with a floating distance pill (e.g. `🔌 2.1m`). Fades in when within 3m; disappears on drop. | Intent Prompt: *"Place desk within reach of east wall socket"*<br>Pills: `[ 🔌 Aligned to Outlet • Easy Cable Reach ]` \| `[ 🧱 Flush to Wall ]` | • $d \le 1.8\text{m}$: *"Direct wall socket access for laptop and desk devices."*<br>• $d > 2.5\text{m}$: *"Desk is ~2.8m from nearest socket — routing an extension cord along baseboards keeps cables tidy."* |
| **🚪 Door Clearances** | Room entry doors, wardrobe/closet doors, balcony doors, ensuite doors | Door hinge coordinate + 90° radial sweep arc on floor | Item bounding footprint approaches within $60\text{cm}$ of door arc | **Door Clearance Arc**: Faint glowing circular sector projected onto floorboards showing full swing path. If sticker footprint overlaps arc, the arc pulses with a soft amber edge warning. | Intent Prompt: *"Maintain 60cm clearance from entry door"*<br>Pills: `[ 🚪 Clear Door Swing • Safe Clearance ]` \| `[ ⚠️ Tight Clearance ]` | • Clearance $< 50\text{cm}$: *"Nightstand is within 45cm of bedroom door swing — verify door opens comfortably without clipping."*<br>• Clearance $\ge 60\text{cm}$: *"Unobstructed door opening clearance."* |
| **🪟 Natural Light & Glare** | Exterior windows, glass sliding doors, skylights | Window width boundaries + natural daylight projection vector | Item placed on window wall or within daylight cone | **Daylight Projection Polygon**: Soft transparent sunlight glow on floor plane; directional arrow indicating light angle relative to object face. | Intent Prompt: *"Position desk under window"*<br>Pills: `[ 🪟 Facing Window • Best Natural Light ]` \| `[ 🖥️ Screen Away from Glare • Contrast Focus ]` | • Desk facing window: *"Good natural daylight on the desk without screen reflection."*<br>• Desk facing opposite wall: *"Monitor may experience afternoon glare from east window."*<br>• Bed under window: *"Bed placed beneath window — consider draft in winter months."* |
| **🚶 Circulation & Walkways** | Primary walking arteries (Door ➔ Bed, Bed ➔ Closet, Desk ➔ Door) | Geometric clearance between two furniture footprints or furniture & wall | Corridor width between obstacles $< 80\text{cm}$ | **Walkway Corridor Dimension**: Subtle dynamic dimension bracket on floor between adjacent edges (e.g. `↔ 55cm corridor`). Appears only when passing through tight pinches. | Intent Prompt: *"Align parallel to wall to preserve main walking corridor"*<br>Pills: `[ 🚶 Parallel to Wall • Preserves Walkway ]` \| `[ 📐 Corner Nook ]` | • Width $< 60\text{cm}$: *"Walkway between bed and wardrobe is narrow (~55cm) — check that walking passage feels comfortable."*<br>• Width $\ge 75\text{cm}$: *"Generous open walking corridor."* |
| **🧱 Wall Snapping & Alignment** | Perimeter drywall, masonry walls, alcove recesses | Wall boundary line on floor horizon | Item within $25\text{cm}$ of room boundary | **Magnetic Boundary Guideline**: Faint glowing alignment guideline along baseboard; object gently snaps parallel to wall plane. | Intent Prompt: *"Place flush against north wall"*<br>Pills: `[ 🧱 Flush to North Wall • Clean Perimeter ]` \| `[ 📐 45° Corner Angle • Cozy Reading ]` | • Alignment confirmed: *"Desk sits flush against north wall, maximizing usable floor space."* |
| **🌡️ Climate & Thermal Zones** | Radiators, baseboard heaters, AC split units | Thermal boundary box | Heat-sensitive furniture (bed, wood desk) within $40\text{cm}$ of radiator | **Thermal Buffer Zone**: Faint warm boundary line around heater; indicates recommended clearance buffer. | Intent Prompt: *"Keep 30cm clearance from radiator"*<br>Pills: `[ ❄️ Maintain Radiator Buffer ]` \| `[ 🧱 Wall Offset ]` | • Distance $< 30\text{cm}$: *"Wooden desk placed close to radiator (~20cm) — ensure adequate heat ventilation."* |

---

## 3. UI Implementation Rules for In-Flight Cues

To ensure the canvas **never feels noisy or cluttered**, in-flight cues follow strict aesthetic heuristics:

1. **Transient Display (Touch-Only)**:
   * In-flight cues are **only rendered while the user's finger is actively holding and dragging a sticker**.
   * The instant the user lifts their finger, all threads, arcs, and dimension brackets smoothly dissolve within 180ms.
2. **Neutral Transparency Palette**:
   * No aggressive neon reds or high-contrast warning triangles.
   * Cues use soft neutral white/amber tints with low opacity (`rgba(255, 255, 255, 0.4)` and `rgba(245, 158, 11, 0.5)`).
3. **Single Active Cue Priority**:
   * If an object simultaneously triggers multiple constraints (e.g., near both an outlet and a door arc), the system renders only the **primary most immediate constraint** to prevent visual overload.
4. **Integration with Architectural Perspective Grid**:
   * All in-flight cues render seamlessly on top of the faint graphite floor perspective grid.
   * While the grid provides subconscious ground plane orientation, constraint cues (threads, swing arcs) communicate relational proximity without permanent canvas clutter. All cues and grid lines dissolve within 180ms upon release.

---

## 4. How SCPF Primes the Generative AI Model

When the user taps **"Done / Visualize"**, the SCPF translates all active constraints and spatial decisions into an explicit structured prompt bundle:

```json
{
  "placement_intent": {
    "asset_id": "desk_01",
    "plane": "floor",
    "coordinates": { "yaw": 42.5, "pitch": -18.2 },
    "orientation": "facing_window",
    "calculated_prompt": "Position work desk directly under east window, flush against wall",
    "user_notes": "Make it dark walnut wood with matte black metal legs",
    "spatial_constraints": [
      {
        "type": "power_socket",
        "distance_meters": 1.4,
        "lighting_relation": "direct_window_daylight"
      }
    ]
  }
}
```

This ensures the generative diffusion model (ControlNet + Inpainting) receives exact geometric intent rather than guessing, resulting in photorealistic renders that honor socket reach, natural daylight direction, and doorway clearances!
