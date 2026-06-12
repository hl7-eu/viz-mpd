# Visualiser Template Reformat — Design Spec

**Date**: 2025-06-11
**Status**: Approved

## Problem

The FHIR lab visualiser templates use stale CSS classes from a predecessor medicinal-product project, have LiquidJS syntax bugs, Bootstrap version inconsistencies, and only render 4 of the 10+ resource types found in actual EU lab bundles. The visual design is dense with pastel backgrounds and no clear hierarchy.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Visual style | Clinical Clean (white cards, left-accent borders, system fonts) | Modern, scannable, professional |
| Layout | Stacked cards with section headers | Mobile-friendly, clear hierarchy |
| Outcome template | Restyled accordion (BS5) | Keep collapsible structure, refresh visuals |
| Framework | Bootstrap 5 migration | Fixes version mismatch, enables modern utilities |
| Resource scope | Full EU Lab scope | Handles all resource types found in server data |
| Color coding | Left-accent borders by context/interpretation | Replaces pastel backgrounds |
| Font | System font stack | Zero loading overhead, native feel |

## Design System

### Typography

- Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Body: `0.9375rem` (15px), line-height 1.5, color `#1e293b`
- Labels: `0.6875rem` (11px), uppercase, letter-spacing `0.05em`, color `#64748b`
- Section headers: `0.75rem` (12px), uppercase, letter-spacing `0.05em`, color `#64748b`

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Primary accent | Blue | `#2563eb` |
| Normal/Success | Emerald | `#10b981` |
| Abnormal/Warning | Amber | `#f59e0b` |
| Critical/Error | Red | `#ef4444` |
| Informational | Slate blue | `#3b82f6` |
| Background | Off-white | `#f8fafc` |
| Card background | White | `#ffffff` |
| Text primary | Dark slate | `#1e293b` |
| Text secondary | Mid slate | `#64748b` |
| Border | Light gray | `#e2e8f0` |
| Patient strip bg | Cool gray | `#f1f5f9` |

### Card Pattern

- White background, `border-radius: 6px`
- Left accent border: `3px solid [context-color]`
- Padding: `12px 16px` (compact), `16px 20px` (standard)
- `border: 1px solid #e2e8f0` for non-accent cards
- No outer box-shadow (flat design)

### Interpretation → Accent Color Mapping

| Interpretation Code | Display | Accent Color |
|---|---|---|
| N | Normal | `#10b981` (emerald) |
| H, HH | High, Critical High | `#ef4444` (red) |
| L, LL | Low, Critical Low | `#ef4444` (red) |
| A | Abnormal | `#f59e0b` (amber) |
| S | Susceptible | `#10b981` (emerald) |
| R | Resistant | `#ef4444` (red) |
| (default) | — | `#3b82f6` (blue) |

## Resource Rendering

### Composition (Hero Card)

Blue left accent (`#2563eb`):

```
┌──────────────────────────────────────────┐
│ ▎ Laboratory Report            [FINAL]  │
│   Dr. Matteo Cervone · 2024-01-15      │
│   SAN RAFFAELE NOMENTANA                │
└──────────────────────────────────────────┘
```

- Title + status (BS5 badge: green for `final`, amber for `registered`, etc.)
- Resolve `author` references to Practitioner/PractitionerRole — display name + organization
- Resolve `custodian` reference to Organization name
- `category` displayed as small labels
- `date` formatted

### Patient (Info Strip)

Gray background strip (`#f1f5f9`):

```
┌──────────────────────────────────────────┐
│ František Očkovaný  ·  M  ·  b. 2000-03-21 │
│ RCIS: 12345 · RID: 67890 · SSN: XYZ      │
└──────────────────────────────────────────┘
```

- Name: prefer `name.text`, fallback to `given[0] + family`, show `prefix` if present
- Gender: single letter abbreviation
- Identifiers: show `<system_last_segment>: <value>` inline

### DiagnosticReport (Summary Card)

Muted card (`1px solid #e2e8f0`):

```
┌──────────────────────────────────────────┐
│ Diagnostic Report                        │
│ Laboratory report · 2022-10-25           │
│ Conclusion: ...                          │
└──────────────────────────────────────────┘
```

- Status badge
- Code display (prefer `.text`, fallback `.coding[0].display`)
- `effectiveDateTime`
- `conclusion` text if present
- `conclusionCode` as badges if present

### Observation (Accent-Border Card)

Color based on interpretation (see mapping above):

```
┌──────────────────────────────────────────┐
│ ▎ Glucose                          Normal │
│   95 mg/dL                               │
│   Ref: 5.5 – 7 mmol/L                   │
│   2024-01-15 · Specimen: Blood           │
└──────────────────────────────────────────┘
```

- Code: prefer `.text`, fallback `.coding[0].display`
- Value:
  - `valueQuantity`: `<comparator><value> <unit>` (e.g., `<= 2`, `> 4 mg/dL`)
  - `valueCodeableConcept`: `.coding[0].display`, fallback `.text`
- Interpretation: badge next to code (right-aligned), color by mapping
- Reference range: show as `Ref: low – high <unit>` if present
- Effective date: small, muted line
- Specimen: small footer line with type + collection date

### Observation (Panel with hasMember)

Section header for the panel, then nested indented cards:

```
  HEPATITIS PANEL
┌──────────────────────────────────────────┐
│ ▎ Hepatitis B Surface Ant         +      │
│   Positive · Interpretation: Abnormal    │
└──────────────────────────────────────────┘
    ┌──────────────────────────────────────┐
    │ ▎ HbsAg Confirm             Normal   │
    │   Negative                           │
    └──────────────────────────────────────┘
```

- Panel observation rendered normally (without value if it only has hasMember)
- Members rendered with indentation (left margin increase)
- Nesting supports up to 3 levels (panel → group → individual)

### Observation (with component)

Compact table-like layout:

```
┌──────────────────────────────────────────┐
│ ▎ Blood Pressure                   Normal │
│   Systolic: 120 mmHg                    │
│   Diastolic: 80 mmHg                    │
│   Ref: 90 – 140 / 60 – 90              │
└──────────────────────────────────────────┘
```

- Each component row: code display + value
- Component values follow same rendering rules as main value

### Organization, Practitioner, PractitionerRole (Compact Cards)

Rendered in a "Supporting Resources" section at the bottom or inline when referenced:

```
  SUPPORTING RESOURCES
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Organization    │ │ Practitioner   │ │ Service Request│
│ SAN RAFFAELE    │ │ Dr. Cervone    │ │ active · order │
│ Hospital        │ │                │ │ Microalbumin   │
└────────────────┘ └────────────────┘ └────────────────┘
```

### ServiceRequest (Compact Card)

- Status badge
- Intent display
- Code display

### Encounter (Compact Card)

- Status badge
- Class code display

### Specimen (Inline in Observation)

Small footer line inside observation card:

```
  🧪 Specimen: Wound · Collected: 2022-10-25
```

## Outcome Template

Keep BS5 accordion structure, restyle:

- **PASS banner**: Green left-border card, not full green background
- **FAIL banner**: Red left-border card, not full red background
- **Issue cards**: Left accent border by severity (red/amber/blue) instead of pastel backgrounds
- Move inline `<style>` to `styles.css`
- Use BS5 accordion utilities for spacing

## Bug Fixes

1. `{{ if }}` → `{% if %}` in bundlelab.liquid (lines 59, 94)
2. `bundle.html`: Update template reference from `mpd.liquid` to `bundlelab.liquid`, migrate to BS5
3. CSS class rename: `.mpd` → `.lab-header`, `.ra` → `.accent-error`, `.ppd` → `.accent-info`, `.mid` → `.section-bg`, `.miding` → `.obs-primary`, `.apding` → `.obs-secondary`, `.apd` → `.obs-tertiary`; remove `.pack`, `.packitem`
4. `templates.json`: Add entries for `Bundle` → `bundlelab.liquid` and `OperationOutcome` → `outcome.liquid`

## Bootstrap 5 Migration

- Replace Bootstrap 4.3.1 CDN links in `index.html` with Bootstrap 5.3.x (CSS + JS bundle)
- Include Popper.js via BS5 bundle (no separate Popper.js needed)
- Update `bundle.html` similarly
- `outcome.html` is already on BS5.3.2 — align to same minor version
- Remove local Bootstrap 4 assets in `apps/assets/bootstrap/`
- Update CSS: BS4 `m-1`, `p-1` → BS5 `m-1`, `p-1` (same), but check any JS-dependent components (accordion already uses BS5 markup)

## Files to Modify

| File | Change |
|---|---|
| `apps/visualiser/templates/bundlelab.liquid` | Full restructure: stacked card layout, resolve all resource types, fix Liquid syntax |
| `apps/visualiser/templates/obs.liquid` | Rewrite: compact card pattern, handle comparator/referenceRange/component, interpretation-based accent |
| `apps/visualiser/templates/outcome.liquid` | Restyle: accent-border cards, move inline styles to CSS |
| `apps/assets/css/styles.css` | Replace with new Clinical Clean design system |
| `apps/visualiser/index.html` | Upgrade to BS5 CDN |
| `apps/visualiser/bundle.html` | Fix template ref, upgrade to BS5 |
| `apps/visualiser/outcome.html` | Align BS5 minor version |
| `apps/visualiser/templates.json` | Add Bundle and OperationOutcome mappings |

## Out of Scope

- Sample test data (`apps/visualiser/resources/`) — the existing medicinal product sample is stale; adding proper lab Bundle samples is a separate task
- `prodbrowser.html` — not part of the visualiser
- `datagen.html` — not part of the visualiser
- Dynamic template routing (`templates.json` lookup in `index.html`) — kept as a future enhancement
- Non-lab resources (CarePlan, Condition, Procedure, FamilyMemberHistory, MedicationAdministration from Bundle/359) — rendered as "Unsupported Resource" fallback cards only