# Project decisions

This document records product decisions separately from implementation proposals.

| ID | Status | Decision | Rationale |
| --- | --- | --- | --- |
| D-001 | Confirmed | Product name: **CUTMETRY** | Broad enough for digitizing, preparation and material cutting |
| D-002 | Confirmed | Merge TraceTrue, PrintProof and NestCraft into one product | Shared geometry and end-to-end workflow |
| D-003 | Confirmed | Interface areas: **Digitize**, **Prepare**, **Nest** | Clear functions within one editor |
| D-004 | Confirmed | All three areas are part of the initial development scope | Avoid losing requirements through indefinite postponement |
| D-005 | Confirmed | Allow entry from any area without a required linear workflow | Users may already have PDFs or vector contours |
| D-006 | Proposed | Retain original inputs and make edits non-destructive | Recoverability, traceability and accuracy |
| D-007 | Proposed | Use millimeters as the canonical physical unit | Consistency across imports, printing and cutting |
| D-008 | Proposed | Keep analysis and layout processing local where feasible | Privacy and predictable file handling |

## Open decisions

- Delivery platform and runtime.
- UI layout and interaction details beyond one editor and three areas.
- Exact project schema and persistence format.
- Geometry and optimization libraries.
- First supported PDF/print workflows and material profiles.
- Acceptance criteria and real-world calibration test set.

Update this record when a technical proposal is explicitly selected or reversed. Do not mark a proposal as confirmed solely because it appears in a planning document.
