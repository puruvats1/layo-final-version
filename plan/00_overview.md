# 360° AI Room Redesign — Project Blueprint & Roadmap

## 📑 Navigation & Step-by-Step Index

| Step | Document | Focus Area |
| :---: | :--- | :--- |
| **01** | [01_scope_and_mental_model.md](./01_scope_and_mental_model.md) | Target users, project scope, core mental model, and design philosophy. |
| **02** | [02_information_architecture.md](./02_information_architecture.md) | App structure, end-to-end user flows, and state management hierarchy. |
| **03** | [03_ui_and_screen_specs.md](./03_ui_and_screen_specs.md) | Detailed screen-by-screen breakdown aligned with your sketches & wireframes. |
| **04** | [04_canvas_interaction_model.md](./04_canvas_interaction_model.md) | Deep dive into 360° sphere, Hold-then-Drag, sticker options, and plane taxonomy. |
| **05** | [05_spatial_cue_and_constraint_framework.md](./05_spatial_cue_and_constraint_framework.md) | Comprehensive Spatial Cue & Constraint Framework (SCPF), in-flight cues & trade-offs. |
| **06** | [06_ai_vision_pipeline.md](./06_ai_vision_pipeline.md) | Inpainting base layer, PNG segmentation, constraint detection & AI synthesis. |
| **07** | [07_tech_stack_and_mvp_roadmap.md](./07_tech_stack_and_mvp_roadmap.md) | Recommended tech stack, development phases, and interactive prototype plan. |
| **08** | [08_future_monetization_and_product_link_ingestion.md](./08_future_monetization_and_product_link_ingestion.md) | *(Post-MVP)* External retail product link ingestion, scraping pipeline & monetization. |
| **09** | [09_additional_user_flows.md](./09_additional_user_flows.md) | 23 detailed user flows, including **add object from an image or product link**. |

---

## 🎯 Quick Executive Summary

* **Target Problem**: People living in compact personal spaces face trial-and-error fatigue. Physically moving heavy furniture to test layouts is exhausting and risky.
* **Core Innovation**: Instead of heavy 3D CAD modeling with complex gizmos and dimensions, users work with a **360° equirectangular photo**. The AI creates a **clean empty base room** and extracts existing furniture into **2.5D draggable PNG stickers**.
* **Agency Over Automation**: The system **guides and highlights trade-offs** (e.g., outlet distance, light path, walkway squeeze) instead of forcing a single "optimal" layout. The user retains complete creative control.
