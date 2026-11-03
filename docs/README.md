# Cutmetry documentation

Cutmetry is one product for digitizing physical patterns, preparing and verifying digital templates, and nesting parts on materials.

**Status:** planning / pre-implementation. The documents distinguish confirmed product decisions from technical proposals. Describing a capability here does not mean it is implemented.

## Start here

- [Product scope](product-scope.md): purpose, confirmed requirements, boundaries, and workflows.
- [Architecture](architecture.md): proposed shared geometry model and editor foundations.
- [Decisions](decisions.md): decisions already made and open technical questions.

## Implementation plans

- [Shared foundation](implementation/foundation.md): project data, imports, precision, editor, and exports.
- [Digitize](implementation/digitize.md): photo to calibrated vector geometry.
- [Prepare](implementation/prepare.md): PDF inspection, printing checks, and virtual assembly.
- [Nest](implementation/nest.md): constrained material layout and optimization.

## Exploration

- [Ideas backlog](ideas/backlog.md): improvements and experiments to evaluate, **not** approved commitments.

## Document conventions

- **Confirmed** = explicitly agreed product direction.
- **Proposed** = a suggested approach pending implementation or evaluation.
- **Open** = unresolved decision or unknown.
- **Implemented** = supported by code and tests; do not use this label before verification.

All three functional areas belong to the initial product scope. Delivery can be incremental, but none of the three is postponed to an undefined later phase.
