---
name: Warm Editorial Artifact
colors:
  surface: '#fbf9f2'
  surface-dim: '#dbdad3'
  surface-bright: '#fbf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ed'
  surface-container: '#efeee7'
  surface-container-high: '#e9e8e1'
  surface-container-highest: '#e3e3dc'
  on-surface: '#1b1c18'
  on-surface-variant: '#56423c'
  inverse-surface: '#30312c'
  inverse-on-surface: '#f2f1ea'
  outline: '#89726b'
  outline-variant: '#dcc1b8'
  surface-tint: '#9d4324'
  primary: '#9a4021'
  on-primary: '#ffffff'
  primary-container: '#b95837'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59d'
  secondary: '#99462a'
  on-secondary: '#ffffff'
  secondary-container: '#fe9572'
  on-secondary-container: '#762c12'
  tertiary: '#5d5c58'
  on-tertiary: '#ffffff'
  tertiary-container: '#767470'
  on-tertiary-container: '#fdffde'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390b00'
  on-primary-fixed-variant: '#7e2c0e'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59e'
  on-secondary-fixed: '#390b00'
  on-secondary-fixed-variant: '#7a2f15'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c9c6c1'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#fbf9f2'
  on-background: '#1b1c18'
  surface-variant: '#e3e3dc'
typography:
  display:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.005em
  prose-lg:
    fontFamily: Newsreader
    fontSize: 19px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0em
  prose-md:
    fontFamily: Newsreader
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-ui:
    fontFamily: Epilogue
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-ui-strong:
    fontFamily: Epilogue
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.005em
  label-md:
    fontFamily: Epilogue
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Epilogue
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  code:
    fontFamily: Courier Prime
    fontSize: 13.5px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 3rem
---

# Bookie - Design System Specification (`Design.md`)

## Brand & Style

This design system draws inspiration from classical book design, scholarly marginalia, and intentional digital craftsmanship. It positions software not as an abrasive utility, but as a calm, contemplative intellectual companion.

### Design Movement
**Literary Minimalism meets Warm Editorial.** Surfaces evoke tactile physical papers (parchment, unbleached linen, heavy bookstock), paired with high-clarity typography and disciplined structural restraint. Visuals remain quiet, allowing thought and generative prose to occupy the primary visual field.

### Key Tenets
- **Parchment as Canvas:** White is never pure `#FFFFFF`. Backgrounds use aged, warm stone and ivory tones that reduce eye strain and establish a peaceful, focus-oriented environment.
- **Thoughtful Typographic Tension:** A dual-type system pairing a classic, scholarly serif for display and prose generation with a contemporary, low-contrast sans-serif for UI controls, inputs, and functional scaffolding.
- **Atmospheric Warmth:** Accents reference terracotta, raw umber, dried persimmon, and sun-baked earth rather than synthetic digital blues or purples.
- **Physical Document Metaphor:** Surfaces behave like papers layered on an architect’s desk: zero heavy blur drop shadows, relying instead on delicate hairline bounds, tonal stepping, and microscopic ring shadows.

---

## Colors

The palette is tuned around tactile, pigment-rich pigments and paper substrates.

### Key Roles
- **Canvas Base (`#f5f4ed`):** The foundational parchment surface. Imbues every workspace with natural warmth.
- **Surface Elevation (`#faf9f5`):** Pure ivory card and elevated reading surface. Provides subtle foreground separation without harsh contrasts.
- **Primary Ink (`#141413`):** Near-black sumi ink tone. Retains the visual gravity of printed letterpress type while avoiding cold digital black.
- **Primary Accent (`#c96442`):** Terracotta. Used for intentional primary actions, key brand moments, focus indicators, and anchor navigation.
- **Secondary Accent (`#d97757`):** Coral terracotta. Used for interactive states, hover highlights, active tab lines, and badges.
- **Muted Editorial Tones:** 
  - Slate Olive (`#5e5d59`): Secondary metadata, timestamps, author lines, and subtle subheaders.
  - Stone Gray (`#87867f`): De-emphasized placeholder text, unselected states, and subtle iconography.
- **Structural Lines:**
  - Border Cream (`#f0eee6`): Delicate hairline dividers and subtle paper borders.
  - Warm Sand (`#e8e6dc`): Active boundaries, hover borders, and secondary button contours.

---

## Typography

The typographic hierarchy distinguishes between content reading/generation and interactive interface operations.

### Font Pairing
- **Serif (`Newsreader`):** Used for headlines, thought models, assistant conversational output, quotes, and long-form prose. Evokes traditional typeset volumes with open counters and graceful italic forms.
- **Sans-Serif (`Epilogue`):** Used strictly for all operational UI, navigation trees, system notifications, form fields, modal headers, buttons, metadata labels, tags, chips, and uppercase status badges. Epilogue lends a distinct, humanistic, and modern editorial voice without ever using default generic sans-serifs.
- **Monospace (`Courier Prime`):** Used for code blocks, token counters, and raw data representations. Keeps the vintage typewriter ethos intact.

### Typesetting Rules
- Maintain generous line heights on serif body blocks (1.6 to 1.7×) to ensure effortless sustained reading across extended narrative streams.
- Restrict prose text containers to an optimal reading line length of 64–74 characters.

---

## Layout & Spacing

Layout philosophy prioritizes expansive breathing room, centered reading conduits, and book-grade margins.

### Layout Model
- **Reading Conduit:** Centered single-column fluid track with a strict max-width of `840px` for conversational threads and rich artifacts.
- **Collapsible Sidebar Deck:** Fixed-width utility dock (`280px` on desktop) that sits cleanly on the parchment canvas, separated only by a warm hair-width boundary or negative space.
- **Margin Cadence:** Large, calm margins frame content like the white space surrounding an intimate poem or essay.

### Breakpoints & Adaptive Rules
- **Desktop (≥ 1024px):** Dual-pane structure with anchored companion navigation; 48px outer canvas margins.
- **Tablet (768px – 1023px):** Collapsible drawer navigation; 32px canvas margins; 720px max reading width.
- **Mobile (< 768px):** Single-column stacked stream; full-width input dock; 20px edge margins.

---

## Elevation & Depth

Visual hierarchy uses physical sheet layering and warm perimeter rings instead of heavy blurred shadows.

### Atmospheric Tiers
1. **Parchment Ground (`#f5f4ed`):** Base canvas background for the application shell and background workspace.
2. **Layered Sheet (`#faf9f5`):** Raised document cards, editor planes, and input capsules. Defined by hairline perimeter borders (`#f0eee6`).
3. **Elevated Floating Overlays:** Popovers, context menus, and toolbars share `#faf9f5` backed by an ultra-refined warm hairline ring and subtle diffused depth:
   - `box-shadow: 0 0 0 1px #e8e6dc, 0 4px 16px -2px rgba(20, 20, 19, 0.04), 0 1px 3px 0 rgba(20, 20, 19, 0.02)`
4. **Modal Dialogs:** Centered document sheets resting atop a 40% warm-tinted backdrop scrim (`rgba(20, 20, 19, 0.3)` with `backdrop-filter: blur(2px)`).

---

## Shapes

Shapes combine modern industrial precision with soft, approachable curvature.

- **Base Radius (0.5rem / 8px):** Applied to functional components including dropdown items, action buttons, message action pills, and code boxes.
- **Large Radius (1rem / 16px):** Applied to chat cards, floating input bars, and contextual panels.
- **Extra-Large Radius (1.5rem / 24px):** Reserved for floating dialog envelopes, modal sheets, and primary action capsules.
- **Pill (9999px):** Applied exclusively to metadata badges, status tags, and model-switching toggle pills.

---

## Components

### Buttons
- **Primary:** Filled `#c96442` background, white text (`#faf9f5`), 8px border radius. Hover state smooths to `#d97757`. Active state settles to `#b35535`.
- **Secondary (Paper Outline):** Background `#faf9f5`, border `1px solid #e8e6dc`, text `#141413`. Hover brings background to `#f5f4ed` and border to `#87867f`.
- **Ghost:** Transparent background, text `#5e5d59`. Hover adds `#e8e6dc` at 40% opacity with `#141413` text.

### Input Fields & Prompt Composer
- **Prompt Capsule:** Floating pill/squircle hybrid (`#faf9f5`), framed by `1px solid #e8e6dc`, with an inner hairline ring. 
- **Focus State:** Border shifts to `#c96442` with an outer ring `0 0 0 1px #c96442`. No aggressive blue glows.
- **Inline Text Inputs:** Pure parchment background, bottom border `1px solid #e8e6dc`, expanding to full hairline framing on active focus.

### Cards & Artifact Panels
- **Artifact Container:** Rendered in ivory (`#faf9f5`), framed with `1px solid #f0eee6`. Features an editorial top header with small monospaced language/type labels in `#5e5d59`.
- **Selected Card:** Rimmed with a subtle terracotta ring (`1px solid #c96442`).

### Checkboxes & Radio Controls
- **Checkboxes:** 18px square with 4px border radius. Border `1.5px solid #87867f`. When checked: fill `#c96442`, border `#c96442`, with a clean parchment check icon.
- **Radio Buttons:** Circular border `1.5px solid #87867f`. Selected: filled ring with `#c96442` pip centered over an ivory interior.

### Chips & Badges
- **Status / Model Tags:** Compact pill shapes with `#e8e6dc` fill, `#5e5d59` typography, uppercase tracking, using `label-sm`.
- **Active Filter Chip:** Terracotta tint (`rgba(201, 100, 66, 0.08)`), border `1px solid #c96442`, text `#c96442`.

### Lists & Citations
- **Marginalia Citations:** Tiny numerical superscript anchors rendered in `#c96442` font; clicking reveals a delicate ivory citation popover with source typography in `body-ui`.
- **Chat Feed Threads:** Generous spacing (`space-lg`) between message groups without artificial separation lines; conversation bubbles rely purely on subtle background shifts between user (`#f0eee6`) and assistant (pure seamless canvas).
