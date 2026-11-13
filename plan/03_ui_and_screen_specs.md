# Step 03: UI & Screen Specifications

[← Back to Step 02](./02_information_architecture.md) | [Back to Overview](./00_overview.md) | [Next: Canvas Interaction Model →](./04_canvas_interaction_model.md)

---

## Screen 1: Home Dashboard (`/`)

*Referenced in wireframes: `Screenshot 2026-09-30 010855.png` and `Screenshot 2026-09-30 132118.png`*

### Purpose
Welcoming starting ground where users view their existing spaces, jump into recent layout variations, or start a new scan.

### Key Components
1. **Header**:
   * Left: Minimalist brand icon / monogram.
   * Center: Current active space pill dropdown (e.g. `My Studio ▼`).
   * Right: Settings icon (profile, storage preferences, lighting defaults).
2. **Featured Recent Card**:
   * Hero card showing current room snapshot with a warm vignette.
   * Metadata: Room name, last modified date, active item count.
3. **Tab Toggle**:
   * Segmented pill: `Projects` vs `Views`.
   * Switching to `Views` displays individual saved setups (e.g., *“Work Setup v1”*, *“Evening Relax”*, *“Minimal Weekend”*).
4. **Card Grid**:
   * 2-column clean card grid with rounded corners (16px border-radius).
   * Thumbnail preview, version badge (e.g. `3 versions`), and quick action dots (`...`).
5. **Floating Bottom Navigation Bar**:
   * Home (`Spaces`), large elevated primary action (`+ New Scan`), and `Profile`.

---

## Screen 2: Capture / Scan Viewport (`/scan`)

*Referenced in wireframes: `Screenshot 2026-09-30 011007.png` and `Screenshot 2026-09-30 132118.png`*

### Purpose
Capture a full 360° panoramic scan or focused zone photo with zero camera clutter.

### Key Components
1. **Full-screen Camera Viewfinder**:
   * Subtle circular gyro level indicator assisting smooth 360 rotation.
   * Zoom indicators (`0.5x` ultra-wide, `1x` standard).
2. **Bottom Mode Selector**:
   * Tactile toggle: `Room (360°)` vs `Zone (Single Image)`.
3. **Action Row**:
   * Gallery upload icon on the left (allows picking an existing 360 equirectangular photo from camera roll).
   * Center large shutter capture button with ring progress animation.
   * Camera flip / sensor reset on the right.
4. **Transition to Processing**:
   * Tap shutter triggers a clean blurred loading state (`Screenshot 2026-09-30 031653.png`): *"Processing your scan & detecting room geometry..."*

---

## Screen 3: Guided Intake Wizard (`/scan/preferences`)

*Referenced in wireframes: `Screenshot 2026-09-30 011018.png` and `Screenshot 2026-09-30 011032.png`*

### Purpose
A dedicated, full-screen sequential step-by-step wizard that guides the user through their lifestyle context, goals, and visual aesthetic before entering the room canvas. Clean, distraction-free, and paced.

1. **Step 1: Space Foundation & Ceiling Scale Calibration**:
   * **Room Name / Identifier**: (e.g., *"My Studio"*, *"Master Bedroom"*).
   * **Ceiling Height Grounding (Metric Anchor)**:
     * *Direct Quick-Pill Selection*: `[ Low ~2.4m / 8ft ]` • `[ Standard ~2.6m / 8.5ft ]` • `[ High ~3.0m+ / 10ft+ ]`.
     * *Intuitive Human "Stack Factor" Fallback*: For users unsure of exact dimensions, tapping *"Not sure / Compare to my height"* opens a friendly, relatable bodily heuristic:
       * Question: *"How high does your ceiling feel compared to you?"*
       * Options:
         * `[ 🧍 Can touch standing up (~1.2× you) ]`
         * `[ 🧍‍♂️ Just out of arm's reach (~1.4× you) ]`
         * `[ 🧗 About one-and-a-half of you (~1.6× you) ]`
         * `[ 🏛️ High loft / cathedral ceiling (~1.8×+ you) ]`
       * The engine uses this intuitive bodily ratio alongside user persona baseline height to calibrate the 3D room bounding box within $\pm 5\%$, eliminating measuring anxiety.
   * Question: *"What feels off about this space right now?"*
   * Clean text area with quick-tap suggestions (*"Desk is dark"*, *"Bed blocks wardrobe"*, *"Tangled cables"*).
3. **Step 3: Activity Keywords (Multi-select Chips)**:
   * Question: *"What will you be doing in this room?"*
   * Minimal rounded pills:
     * 💻 `Focus / Work`
     * 🛌 `Deep Sleep`
     * 📖 `Reading & Unwinding`
     * 🧘 `Movement / Yoga`
     * 🎨 `Creative Projects`
     * 👥 `Socializing`
4. **Step 4: Visual Moodboard & References**:
   * Visual aesthetic presets (*Warm Minimalist, Japandi, Industrial Cozy, Nordic Light*).
   * Optional image uploader for camera roll inspiration or reference links.
5. **Navigation & Controls**:
   * Step indicator dots at the top (`● ○ ○ ○`).
   * Back button and clear `Next →` primary CTA button.
   * Subtle `Skip for now` text button for users who want to jump straight into editing.

---

## Screen 4: Constraint & Asset Verification (`/scan/review`)

*Referenced in wireframes: `Screenshot 2026-09-30 011047.png`*

### Purpose
Provides transparent confirmation of what the AI detected before jumping into editing. Builds user trust and avoids black-box frustration.

### Key Components
1. **Interactive 360 Preview**:
   * Subtle glowing markers anchored to architectural realities:
     * 🪟 Windows (with sun ray indicator)
     * 🚪 Doors (with outward/inward arc)
     * 🔌 Power Outlets / Switchboards (pulsing connection dots)
2. **Detection Counters**:
   * Clean counter chips: `1 Door` • `2 Windows` • `3 Outlets` • `6 Furniture Assets`.
3. **Tap-to-Adjust (Optional)**:
   * Quick tap on any detected tag lets user rename or correct it (e.g. change *"Cabinet"* to *"Bookshelf"*).
4. **Primary CTA**:
   * *"Open Playground →"* button.

---

## Screen 5: The 360° Editing Playground (`/canvas/:projectId`)

*Referenced in wireframes: `Screenshot 2026-09-30 011058.png` and sketches `130252.png`, `130617.png`*

### Purpose
The heart of the application. An uncluttered, tactile canvas where users physically reposition items and prompt edits via natural interaction.

### Design Language: Spatial Immersion (Apple Spatial Design Principles)
* **Priority of Environmental Space**: 90%+ of the screen is dedicated purely to the photographic room panorama.
* **Shape Language**: Floating pill-shaped islands with generous border radiuses (`rounded-full` / `24px+`), elevated with subtle drop-shadows rather than heavy borders or cluttered sidebars.
* **Calm Typography & Contrast**: Subtle muted backgrounds ensuring controls float softly over bright or dark room corners without blocking sightlines.
* **No Lighting Widgets**: Lighting adjustments are handled downstream by AI restyling, keeping the canvas strictly focused on spatial arrangement and physical items.

---

### Exact Elements Visible at First Glance (Initial Load State)

When the user enters the canvas from onboarding, **only these 3 components** are present:

1. **Full-Bleed 360 Panoramic Viewport**:
   * Equirectangular photo viewer filling the entire screen behind the UI.
   * Smooth 1-finger swipe rotation, 2-finger pinch zoom.
   * Clean inpainted room base layer seamlessly displayed.

2. **Top Floating Header Island**:
   * **Left**: `<` Back chevron (returns to Projects dashboard).
   * **Center**: Room Title (e.g., `Bedroom Studio`).
   * **Right**: Undo (`↶`) and Redo (`↷`) icons + `...` options menu (Reset to Original, Duplicate Setup).

3. **Compact Floating Island Bottom Dock**:
   * A single, elegant floating pill centered at the bottom of the screen:
     * `[ + Asset ]` — Opens slide-up asset drawer.
     * `[ ✨ Starters ]` — Opens 2-3 layout starter suggestions based on onboarding goals.
     * `[ Done / Visualize ]` — Elevated primary action button that triggers generation.
     * `[ Original / Draft ]` — Quick toggle to peek at original room state.

4. **Extracted Furniture Stickers**:
   * Furniture cutouts resting at their **scanned real-world positions** on the floor.
   * Each sticker has a subtle ambient floor contact shadow anchoring it to the ground.

---

### Tactile Interactions & Micro-Affordances

1. **Direct Hold & Drag**:
   * Touching an object immediately lifts it off the floor with a subtle elevation shadow.
   * **In-Flight Faint Architectural Perspective Grid**:
     * While dragging, a **delicate graphite/pencil-sketch perspective grid** appears dynamically across the floor plane, visually anchoring movement to the room's receding vanishing lines.
     * **Strict Zero-Numbers Rule**: No numeric dimensions, bounding boxes, or scale values are shown in the UI. The grid provides purely intuitive, tactile depth awareness.
     * When the user lifts their finger, the perspective grid smoothly dissolves within 180ms.
   * **Dynamic Perspective Foreshortening**:
     * Dragging an object deeper along the floor plane automatically scales it down mathematically via perspective projection $\text{Size} \propto 1/Z_{depth}$; dragging forward enlarges it. The user never needs to manually pinch-to-scale.
   * **Directional Floor Footprint**: A soft, faint glowing oval with a subtle directional arrow projects onto the floor plane beneath the sticker, indicating front-facing orientation.
   * **Edge Auto-Pan**: Dragging within 40px of the phone’s left or right edge smoothly rotates the 360 camera view.
   * **In-Flight Silent Cues**: If the item approaches an outlet or door, a whisper-quiet cue appears (e.g. subtle connecting thread: `🔌 2.1m` or faint door swing arc). Released touch smoothly fades the cue out.

2. **On-Drop Suggestive Orientation Pills (Zero Manual Rotation)**:
   * Releasing the sticker immediately presents the calculated intent tag:
     * Auto-calculated prompt: *"Position desk under east window"* (tap pencil to edit).
     * **Suggestive Orientation Pills with Rationale**: The engine evaluates room geometry and surfaces 2–3 contextual alignment options:
       * Near window: `[ 🪟 Facing Window • Best Natural Light ]` | `[ 🧱 Flush to Wall • Clean Flow ]`
       * In corner: `[ 📐 45° Corner Angle • Cozy Reading ]` | `[ 🧱 Flush to Left Wall • Clean Perimeter ]`
     * Tapping a pill instantly updates orientation and commits the placement. Tapping outside collapses the tag into a tiny, unobtrusive `💬` pin.

3. **Single Tap on Sticker (Action Menu)**:
   * Reveals a clean 4-action floating island directly above the object:
     * `[ ✋ Move ]` — Tap to enter active repositioning mode.
     * `[ 🎨 Variants ]` — Toggle between visual variants (original scan, restyled wood finishes, multi-angle views).
     * `[ 💬 Note ]` — Type or dictate a custom design instruction (e.g., *"Make it dark walnut"*).
     * `[ 🗑️ Erase ]` — Smooth puff-fade animation; sends item to Asset Drawer.

4. **Asset Drawer (Slide-Up Spatial Sheet)**:
   * Tapping `+ Asset` opens a half-height sheet with tabs: *Room Originals (Erased)*, *Decor Presets*, *Custom Upload*.
   * **Tap to Place**: Spawns item at the center of the current screen view.
   * **Drag to Place**: Dragging an asset upwards automatically closes the drawer; item attaches to finger for direct floor placement. Dragging to the extreme top edge cancels placement and reopens the drawer.

5. **Layout Starters (Quick Springboards)**:
   * Tapping `✨ Starters` opens a minimal horizontal tray of 2–3 activity-based setups (e.g. *"Window Workstation"*, *"Open Center"*).
   * Tapping a card animates the stickers into position, providing an immediate starting point that the user can freely tweak.

## Screen 6: Continuous Synthesis & Live Exploration (`/canvas/:projectId`)

*Referenced in sketches: `Screenshot 2026-09-30 130103.png` and `132431.png`*

### Purpose
Presents the synthesized photorealistic space while maintaining **100% live layered interactivity**. The user is never trapped in a static render; they can immediately continue adjusting items or exploring options.

### Key Components & Continuous Staging Behavior
1. **Live High-Res Synthesized Scene (Non-Destructive Layers)**:
   * The AI updates the **Base Room Backdrop** with ambient moodboard lighting, wall paint warmth, and clean flooring.
   * Furniture stickers update to their **High-Res Relit Variants** (transparent PNGs with harmonized ambient lighting and baked contact shadows).
   * **No Dead-End Mode**: Furniture items remain **fully draggable stickers on the floor plane**. If the user drags the chair again, the synthesized floor beneath is naturally exposed. They can continue rearranging and stop whenever they are satisfied.
2. **Architectural Anchor Tags (Guardrailed Styling over Freehand Brushing)**:
   * Tapping any fixed architectural marker (e.g. `🪟 Window`, `🧱 Wall`) opens contextual accent chips:
     * *Window Accents*: `[ 🪟 Sheer Linen Drapes ]` • `[ 🪵 Wood Venetian Blinds ]` • `[ 🌿 Hanging Plant Hook ]`
     * *Wall Accents*: `[ 🎨 Gallery Frame ]` • `[ 🪜 Leaning Mirror ]`
   * Eliminates messy fingertip brush masks while guaranteeing photorealistic perspective, scale, and daylight filtering.
3. **Alternative Vibe Exploration**:
   * Floating action pill: `✨ Generate Alternative Vibe` to quickly explore a secondary lighting/color tone variation without changing furniture coordinates.
4. **Silent Spatial Guidance (On-Demand)**:
   * **No automated popups, drawers, or alarming warning tags.**
   * An unobtrusive floating chip: `💡 Room Insights (3)` in the corner.
   * Tapping it reveals a calm, neutral observation sheet:
     * *"Desk is ~2.8m from nearest socket (extension cord may be useful)."*
     * *"Bed placement leaves 45cm clearance with the entry door."*
     * *"Desk receives indirect morning sunlight from the window."*
   * Purely informative; zero severity colored badges (no red/yellow warning labels).
5. **Seamless In-Place Controls**:
   * `Save as Activity Mode` (e.g., *"Work Setup"*, *"Evening Unwind"*, *"Open Floor"*).
   * `Peek Original` (hold-to-peek toggle crossfading back to the original room scan).

---

## Screen 7: Comparison View (`/canvas/compare`)

*Referenced in sketches: `Screenshot 2026-09-30 130103.png`*

### Purpose
Allows users to evaluate before and after without screen clutter or split-screen eye strain.

### Key Components
1. **Seamless In-Place Flip Toggle**:
   * A tactile floating toggle button at the bottom: `[ Original Scan ]` ↔ `[ New Redesign ]`.
   * Tapping smoothly crossfades between the original room and the newly synthesized redesign in the exact same orientation.
   * **Hold-to-Peek Interaction**: Press and hold anywhere on a compare chip to instantly view the original room; release to snap back to redesign.
2. **Setup Selector**:
   * Dropdown or bottom thumbnail cards to pick which two versions to compare (e.g., *Original Scan* vs *Focus Setup*, or *Focus Setup* vs *Open Space Setup*).
3. **Action**:
   * `Keep this Setup` or export summary checklist.
