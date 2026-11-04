# PetSphere design-system migration

## Reviewed application areas

- [x] Global foundation (`app/globals.css`): semantic colours, typography, spacing, surfaces, controls, states, responsive tables, and shared utilities.
- [x] Public and authentication route CSS modules: reviewed against the shared tokens; route-specific image, map, and article layouts remain scoped.
- [x] Owner booking and sitter-discovery routes: reviewed; the Leaflet map stylesheet remains deliberately local.
- [x] Owner dashboard and pet-family shared components: dashboard navigation/topbar work is token-based; pet cards and deletion UI now use shared card, button, panel, and semantic text styles.
- [x] Sitter route CSS modules and sidebar: reviewed; timetable/calendar and service-specific visual treatments remain scoped.
- [x] Admin shell and admin route CSS modules: reviewed; the common shell now uses semantic colour, surface, border, typography, shadow, and focus tokens without forced `!important` state styles.
- [x] Marketplace route CSS modules and shared topbar: reviewed; the shared dashboard topbar is now token-based.

## Consolidated shared styles

- [x] `ps-card`, `ps-panel`, `ps-btn`, `ps-input`, `ps-select`, `ps-textarea`, `ps-label`, `ps-badge`, `ps-alert`, and `ps-table` are the shared primitives.
- [x] Added semantic feedback-surface tokens and shared semantic text/icon-button utilities rather than introducing route-level colour systems.
- [x] Removed the duplicated delete-error rendering in the shared pet deletion modal.

## Pet Owner migration (current pass)

- [x] Owner pet family/list: page shell, primary action, summary cards, category controls, and search field use shared page, card, button, badge, input, and semantic-text primitives.
- [x] Owner dashboard and owner bookings shells now use `.ps-page` instead of route-specific background colours, matching marketplace and pet-management surfaces.
- [x] Add pet: page shell, labels/errors, primary form fields, card sections, actions, and status messages use shared primitives. Upload previews and selected-file rendering remain local functional styles.
- [x] Shared pet card/grid and dashboard topbar: migrated in the prior pass and retained in this owner-only pass.
- [ ] Pet details and edit-pet form: reviewed; legacy styling remains.
- [ ] Owner dashboard overview: reviewed; its bespoke hero/media composition and legacy cards remain for a focused follow-up.
- [~] Sitter discovery/profile cards and Leaflet map: reviewed; map geometry remains an intentional exception and the discovery/card pass is tracked below.
- [x] Owner sitter discovery/card pass: shared panels, cards, badges, skeleton surfaces, primary search action, semantic text, and filter states now reuse global tokens; Leaflet map geometry remains local.
- [ ] Booking list, booking wizard, and booking details: reviewed; shared booking utilities are in place but route-local styling remains.
- [ ] Owner marketplace/new-ad and My Ads: reviewed; route-local CSS remains for a follow-up conversion.

### Owner audit after this pass

- 750 literal-colour/arbitrary Tailwind styling occurrences remain in owner-scoped sources.
- Retained functional exceptions: Leaflet map presentation, image previews/cropping, and dashboard hero media overlays.

## Cross-role shell alignment

- [x] Pet Sitter sidebar and dashboard header aligned to the owner shell geometry, spacing, surfaces, active navigation treatment, and responsive drawer behavior.
- [x] Pet Sitter shell parity pass: owner-style active navigation indicator, header shadow/border treatment, responsive padding, and mobile drawer shadow applied across all sitter routes through the shared layout.
- [x] Pet Sitter sidebar now directly reuses `OwnerSidebar` with sitter-specific navigation configuration, guaranteeing identical desktop/mobile structure while preserving sitter routes and actions.
- [x] Admin sidebar and top bar aligned to the same 248px sidebar / 64px header proportions and shared semantic tokens.
- [x] Sitter marketplace shell offset updated to match the shared sidebar width.

## Intentional retained exceptions

- Image and avatar cropping, map/Leaflet rules, chart/data visualisation colours, gradients used for avatar/image placeholders, and animation-specific values remain local because they describe media or unique layouts rather than reusable UI primitives.
- Some route-specific modules still contain legacy literal values. They are tracked for incremental replacement where a token-equivalent does not change a deliberately tuned visual treatment.

## Verification

- [x] `npm run lint` (passes with 24 pre-existing warnings; no errors)
- [x] `npm run build` (passes)
