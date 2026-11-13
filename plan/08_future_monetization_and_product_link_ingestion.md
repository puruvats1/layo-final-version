# Step 08 (Post-MVP): External Product Ingestion & Monetization Blueprint

[← Back to Step 07](./07_tech_stack_and_mvp_roadmap.md) | [Back to Overview](./00_overview.md)

---

## 1. Executive Summary & Core Business Model

While the MVP strictly focuses on rearranging and restyling existing spaces with zero catalog clutter, **External Product Ingestion** serves as the primary monetization engine for the commercial production application.

Rather than forcing users to browse a limited, sponsored in-app furniture marketplace, users can **paste a link from any external retailer** (e.g., IKEA, West Elm, CB2, Amazon, Wayfair, or local boutiques). The system ingests the external product page, extracts its dimensional and visual data, and stages it directly into the user's calibrated 3D room canvas with purchase attribution.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRODUCT INGESTION & COMMERCE LIFECYCLE               │
│                                                                        │
│  [1. External Link]  ──▶  [2. Scraping & CV]  ──▶  [3. 3D Scaling]     │
│   User pastes URL          Extracts RGB photo      Extracts W×D×H      │
│   (IKEA / West Elm)        & removes background    assigns plane       │
│                                                          │             │
│  [6. Affiliate / Buy]◀──  [5. Synthesis]     ◀──  [4. Staging]         │
│   Direct purchase          Rendered into room      Plane-locked drag   │
│   monetization cut         with cast shadows       & auto-scale        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Ingestion Pipeline

### Step 1: URL Parsing & Metadata Extraction
* **Input**: User pastes an external e-commerce product URL into the Asset Drawer under `+ Add by Link`.
* **Headless Scraping & Structured Metadata**:
  * Extracts product title, retail price, and OpenGraph/carousel product imagery.
  * Uses regex and LLM parsing on the product specifications table to extract **metric physical dimensions** ($W \times D \times H$ in cm/inches).

### Step 2: Background Dissolution & Alpha PNG Extraction
* Runs automated background removal (BiRefNet / SAM 2) on the primary high-res product photo.
* Synthesizes the transparent PNG asset with feathered edges (1–2px) and a baked ambient floor contact shadow polygon.

### Step 3: Grounded Metric Scale & Plane Assignment
* Binds the extracted real-world dimensions into the asset's **Invisible Intrinsic Integer Scale** (`intrinsicScaleCm: { width, depth, height }`).
* Categorizes the item into its appropriate plane (`floor`, `wall`, or `surface`).
* When dropped into the user's room, it scales with mathematical precision against the room's Manhattan 3D hull. A $90\text{cm}$ nightstand is physically impossible to render oversized next to an existing bed.

---

## 3. Monetization & Business Mechanisms

1. **Affiliate Commerce Commission**:
   * Outbound affiliate links (skimlinks, Amazon Associates, Sovrn Commerce, direct retail partnerships) earn a 4%–12% commission on purchases initiated from the room design.
2. **"Shop This Redesign" Summary**:
   * Post-generation insights drawer compiles an interactive shopping checklist showing all staged new items with direct retailer buy links and total budget sum.
3. **Alternative Item Recommendation (Value Swap)**:
   * AI suggests aesthetically matching lower-cost alternatives if a user wants the look for less (e.g., *"Find a similar $120 desk to this $600 West Elm desk"*).

---

## 4. MVP Boundary Status

* **Status**: Deferred to Post-MVP (Phase 2).
* **Rationale**: The core spatial rearrangement engine, clean base room inpainting, and plane-locked perspective scaling must be perfected first before adding external scraping dependencies and affiliate integrations.
