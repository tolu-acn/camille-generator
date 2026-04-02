# PRD: Camille Generator

## 1. Product summary

Camille Generator is a desktop-first web tool that helps users generate and fine-tune abstract, grainy, gradient-based visual backgrounds inspired by editorial slide covers and presentation art direction.

The product lets users adjust colour gradients, soft glow fields, texture, crayon-like scribble marks, and overall composition in real time. The preview sits on the **left**. The controls sit in a **fixed panel on the right**.

Typography and text rendering are explicitly out of scope. The goal is to create the visual background layer only.

---

## 2. Problem statement

Users can describe the style they want, but getting to the exact visual output is slow and inconsistent. The main pain points are:

* too many variables are hidden inside a prompt
* it is hard to isolate what changed between versions
* it is hard to preserve a good composition while exploring variations
* reference styles like the ones shared depend on subtle relationships between gradient, glow, grain, and corner marks

Users need a visual tool that exposes the key levers directly so they can art direct the result instead of repeatedly regenerating from scratch.

---

## 3. Goals

### Primary goal

Enable users to create and refine abstract presentation-style background images with immediate visual feedback.

### Secondary goals

* make visual exploration fast and intuitive
* let users randomise some layers while locking others
* support export of the final background at presentation-friendly dimensions
* provide enough control to recreate looks similar to the references

---

## 4. Non-goals

The MVP will **not** include:

* text rendering
* font controls
* slide authoring
* multi-slide editing
* animation
* layer masking with complex vector tools
* AI prompt generation
* collaborative editing
* mobile-first layout

The reference images include text and large numeric forms. Actual text rendering is out of scope. The system only needs to create the background artwork.

---

## 5. Target users

### Primary user

Designers, presenters, and makers who want a polished abstract background for slides, covers, hero images, or visual boards.

### Secondary user

Non-designers who want to tweak an aesthetic background without using Figma or Photoshop.

---

## 6. Product concept

The tool is a **parameter-based visual generator**.

The user edits a live preview using controls for:

* background gradient
* soft colour masses / glow regions
* grain and noise
* decorative crayon-like scribble marks
* composition and edge placement
* randomness and export

The output is a static image.

---

## 7. Core UX

### Layout

#### Left side: live preview

* occupies roughly 65 to 75 percent of the page width
* large canvas showing the generated background
* centred vertically in the viewport
* uses a slide-like aspect ratio by default (16:9)
* supports zoom-to-fit only in MVP
* optional overlay toggle for safe margins / title area guides
* displays "camille." branding top-left and dimension label bottom-left

#### Right side: control panel

* fixed width of 340px
* fixed or sticky panel
* vertically scrollable with thin 4px scrollbar
* grouped into collapsible sections
* all sections collapsed by default except Presets
* includes sticky action footer with Shuffle and Export buttons

This layout is important. The preview should feel like the product. The panel should feel like a tool rail, not the main experience.

---

## 8. UI design system

### Implemented aesthetic

The application uses a **minimalist dark mode** design.

### Theme tokens (CSS custom properties)

* `--bg-deep: #07070a` — page background
* `--bg-panel: #0e0e12` — control panel background
* `--bg-section: #141418` — nested card/field background
* `--bg-input: #1a1a1f` — input/slider track background
* `--bg-hover: #1f1f26` — hover state background
* `--border: #232329` — standard border
* `--border-subtle: #1c1c22` — subtle dividers
* `--text-primary: #d8d8de` — primary text
* `--text-secondary: #6e6e7a` — labels, secondary text
* `--text-dim: #4a4a54` — dimmed/hint text
* `--accent: #b8845a` — warm amber accent
* `--accent-hover: #cda07a` — accent hover state
* `--radius: 6px` — standard corner radius
* `--radius-lg: 10px` — canvas/card radius
* `--transition: 150ms ease` — standard transition

### Typography

* **Headings**: Syne (600, 700, 800) — geometric, bold, distinctive
* **Body / UI labels**: Outfit (300, 400, 500, 600) — clean, modern, slightly warm
* **Mono / values**: Azeret Mono (400, 500) — for numeric values and dimension labels
* All loaded from Google Fonts
* Base font size: 13px
* Section titles: 11px uppercase with 0.1em letter-spacing

### Component patterns

* **Sliders**: 4px track height, 12px circular thumb, accent colour on hover
* **Colour pickers**: 28×28px rounded swatch with overflow-hidden native input
* **Buttons**: 1px border, 6px radius, 11px font, accent variant for primary action
* **Lock toggles**: 32×18px pill toggles with sliding 12px circle indicator
* **Section headers**: clickable with chevron indicator, rotate -90deg when collapsed
* **Field items**: nested cards with `--bg-section` background and subtle border
* **Tooltips**: bottom-anchored on `[data-tip]` elements

---

## 9. Visual style to support

Based on the references, the system should support these visual characteristics:

* soft, diffused gradient backgrounds
* high-density fine grain across the entire image
* blurred colour blooms or glow fields
* subtle vertical or directional wash-like transitions
* corner-anchored crayon or pastel-like scribble marks
* balanced negative space for future text placement
* presentation-cover compositions with a clear focal region

The generated images do not need to be identical to the references, but they should sit in the same visual family.

---

## 10. Functional requirements

### 10.1 Preview canvas

The preview:

* updates in real time as controls change via `requestAnimationFrame` render loop
* reflects the current aspect ratio and export size
* renders all layers in order: background gradient → glow fields → vignette → grain → marks → safe area overlay
* applies post-processing filters (saturation, brightness, contrast) via canvas filter API
* uses an offscreen canvas for compositing before drawing to the visible canvas

#### Acceptance

User sees visual changes within one animation frame (~16ms).

---

### 10.2 Background gradient controls

Simplified to essential controls only:

* **Left colour** — colour picker
* **Mid colour** — colour picker
* **Right colour** — colour picker
* **Direction** — slider (0–360°)

The 3-stop linear gradient direction is computed from the angle, projecting across the full canvas diagonal.

---

### 10.3 Glow / bloom field controls

Per-field controls (up to 5 fields):

* **Colour** — colour picker
* **Position X** — slider (0–100%)
* **Position Y** — slider (0–100%)
* **Size** — slider (5–100%), sets both width and height uniformly
* **Softness** — slider (10–300px blur)

Each field renders as a blurred ellipse using canvas `filter: blur()` with configurable opacity and stretch.

---

### 10.4 Texture and grain controls

Simplified to a single control:

* **Grain** — slider (0–100), drives both amount and opacity together (opacity = amount × 0.55)

Grain is rendered as a full-resolution noise ImageData buffer composited with `overlay` blend mode. Supports monochrome and colour modes internally, defaulting to monochrome.

---

### 10.5 Scribble / mark controls

Per-mark controls:

* **Anchor** — select (Bottom Left, Top Right, Bottom Right, Free)
* **Colour** — colour picker
* **X** — slider (-20% to 120%), allows off-screen positioning
* **Y** — slider (-20% to 120%), allows off-screen positioning
* **Length** — slider (40–300px), controls stroke length
* **Intensity** — combined slider (0–100) that drives roughness, wobble (×0.85), and zigzag (×0.5) together
* **Opacity** — slider (0–100%)

#### Crayon rendering technique

Marks are rendered as particle-based crayon strokes, not bezier curves:

* Each stroke is a near-vertical diagonal line at roughly -75° with random angle variation
* Strokes are built from hundreds of tiny scattered rectangular particles (0.5–2.5px) along the path
* ~35% of particles are randomly skipped to create gritty, broken coverage
* Particles scatter across the full stroke width (thickness × 3) for a thick, waxy feel
* Each particle has individually varied opacity (0.15–0.7) for natural texture
* Larger gritty chunks are added along stroke edges for rough borders
* A seeded PRNG (Mulberry32) ensures deterministic output for the same mark position

#### Anchor positions

* Bottom Left: x=0.03, y=0.92
* Top Right: x=0.92, y=0.18
* Bottom Right: x=0.92, y=0.92
* Free: x=0.5, y=0.5

---

### 10.6 Composition controls

Simplified:

* **Vignette** — slider (0–100%)
* **Safe area guides** — checkbox toggle

The vignette renders as a radial gradient from transparent centre to black edges. Safe area overlay draws dashed rectangles at 10% inset (title safe) and 5% inset (action safe).

---

### 10.7 Randomise and lock controls

#### Shuffle button (sticky footer)

Randomises all unlocked layers in one click.

#### Lock toggles (Locks section, collapsed by default)

* Lock background
* Lock glow fields
* Lock texture
* Lock marks

Each lock is a pill toggle. When active, the corresponding layer is preserved during shuffle operations.

---

### 10.8 Presets

6 presets, displayed as a 3×2 grid of mini canvas previews with gradient + glow rendering:

#### Reference-matched (3)

1. **Peach Lavender** — warm peach → pink → cool lavender, orange + pink crayon marks
2. **Deep Violet** — indigo base with violet/magenta blooms, heavy grain, chalky marks
3. **Magenta Sunset** — blue corner, hot pink bloom, warm orange/peach sweep

#### Purple-free variations (3)

4. **Terracotta** — warm clay/sand/beige tones
5. **Seafoam** — teal/mint/green tones
6. **Burnt Gold** — amber/orange/gold tones

Presets section is **open by default**; all other sections are collapsed. Clicking a preset loads the full parameter set while respecting layer locks. Active preset is highlighted with accent border.

---

### 10.9 Export

* **Size** — select: 1920×1080, 1600×900, 2560×1440
* **Format** — select: PNG, JPG, WebP

Export renders at full resolution to a separate canvas (not the preview canvas), generates fresh grain noise, and triggers a browser download. Safe area guides are excluded from export.

---

## 11. Right panel information architecture

Sections in order, with default collapsed state:

| Section | Default state |
|---------|--------------|
| 1. Presets | **Open** |
| 2. Background | Collapsed |
| 3. Glow Fields | Collapsed |
| 4. Texture | Collapsed |
| 5. Marks | Collapsed |
| 6. Finish (vignette + safe area) | Collapsed |
| 7. Locks | Collapsed |
| 8. Export | Collapsed |

Sticky footer contains two buttons: **Shuffle** (randomise unlocked) and **Export** (accent button).

---

## 12. Interaction model

### Implemented interactions

* slider drag updates preview live
* colour picker updates preview live
* toggles show immediate effect
* preset loads full parameter set (respects locks)
* randomise respects locks
* export uses current state
* collapsible sections persist state while editing
* marks can be positioned off-screen (-20% to 120% range)

### Future (not in MVP)

* drag glow centres directly on canvas
* drag scribble groups directly on canvas
* undo / redo
* keyboard shortcuts for reset, randomise, export

---

## 13. Data model

A background configuration is a single JSON-serialisable object:

```
state = {
  canvas: { width, height },
  background: {
    colors[3],          // hex strings
    stops[3],           // 0–1 float positions
    direction,          // 0–360 degrees
    saturation,         // 0–200%
    brightness,         // 0–200%
    contrast,           // 0–200%
    blendSoftness       // 0–100
  },
  glowFields[]: {
    x, y,               // 0–1 normalised position
    width, height,      // 0–1 normalised size
    blur,               // px
    opacity,            // 0–1
    color,              // hex
    stretch,            // float multiplier
    smear               // reserved
  },
  texture: {
    amount,             // 0–100
    size,               // 0.5–3
    contrast,           // 0–100
    opacity,            // 0–100
    colorMode,          // 'mono' | 'color'
    softness            // reserved
  },
  marks[]: {
    anchor,             // 'bottom-left' | 'top-right' | 'bottom-right' | 'free'
    x, y,               // -0.2 to 1.2 (allows off-screen)
    scale,              // float multiplier
    rotation,           // degrees
    thickness,          // stroke width
    roughness,          // 0–100
    curvature,          // 0–100
    zigzag,             // 0–100
    wobble,             // 0–100
    color,              // hex
    opacity,            // 0–100
    strokes,            // count
    length              // 40–300px per stroke
  },
  composition: {
    focalX, focalY,     // 0–1 normalised
    vignette,           // 0–100
    padding,            // reserved
    safeArea            // boolean
  },
  locks: {
    background,         // boolean
    glowFields,         // boolean
    texture,            // boolean
    marks               // boolean
  },
  export: {
    width, height,      // px
    format,             // 'png' | 'jpeg' | 'webp'
    quality             // 10–100
  }
}
```

---

## 14. Technical implementation

### File structure

```
camille-bg/
├── index.html              # HTML structure, section layout
├── styles.css              # All CSS (theme, components, layout)
├── app.js                  # State, rendering, controls, presets, export
└── camille-generator-prd.md # This document
```

### Rendering pipeline

1. Clear offscreen canvas
2. Draw 3-stop linear gradient (background layer)
3. Draw glow field ellipses with canvas blur filter
4. Draw radial vignette gradient
5. Generate and composite noise grain (overlay blend mode)
6. Draw crayon marks (particle-based)
7. Draw safe area guides (if enabled)
8. Apply saturation/brightness/contrast filters to visible canvas
9. Re-draw marks and safe area on top (unaffected by filters)

### Performance

* `requestAnimationFrame` render loop with dirty flag — only re-renders when state changes
* Noise ImageData is cached and only regenerated when grain size or colour mode changes
* Offscreen canvas used for compositing to avoid flicker

---

## 15. MVP scope

The MVP includes:

* left preview / right panel layout
* 3-stop gradient background with direction control
* 2 to 5 glow fields with colour, position, size, softness
* full-surface grain layer with single-slider control
* up to 5 crayon-style mark groups with position, length, intensity, opacity
* 6 presets (3 reference-matched, 3 purple-free)
* shuffle with per-layer locks
* export to PNG / JPG / WebP at 3 resolution options
* safe-area overlay toggle
* dark minimalist UI theme
* desktop support only

---

## 16. Future scope

Not part of MVP, but logical next steps:

* save and load projects
* multiple artboards / slides
* AI-assisted variation generation
* brush drawing mode
* decorative shape overlays
* SVG export
* template packs
* collaborative links
* motion export
* custom preset creation and saving

---

## 17. Success metrics

The product is successful if users can:

* create a polished background in under 5 minutes
* clearly understand what each major control does
* get visually distinct outputs without leaving the tool
* export a usable presentation background without post-processing

Useful product metrics:

* time to first export
* preset usage rate
* shuffle usage rate
* average number of adjustments before export
* export completion rate

---

## 18. Acceptance criteria

### Layout

* preview is always on the left
* control panel is always on the right (340px fixed width)
* panel remains usable without obscuring the preview
* all sections collapsed by default except Presets

### Visual editing

* all core controls update the preview live
* users can change gradient, grain, and marks independently
* preset changes produce clearly different looks
* marks render with crayon-like particle texture, not smooth lines
* marks can be positioned partially off-screen

### Output

* exported image matches preview state
* exported files open correctly in common presentation tools
* safe area guides are excluded from exports

### Scope protection

* no text rendering is implemented in MVP
* the product only focuses on the background artwork system

---

## 19. Open questions

1. Should the preview allow direct manipulation of marks and glow centres, or should MVP remain panel-only?
2. Should presets be fixed only, or editable and saveable by the user?
3. Should the safe-area overlay be generic, or should it mimic slide-cover layouts more closely?
4. Should the product support only one aspect ratio in MVP, or a few common presentation ratios?

---

## 20. Product definition

**Camille Generator** — a desktop web tool for generating and fine-tuning grainy, gradient-rich abstract backgrounds for presentation and editorial use.
