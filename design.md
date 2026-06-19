---
name: Tonal Serenity
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#3a3f39'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#747872'
  outline-variant: '#c4c8c0'
  surface-tint: '#45593f'
  primary: '#3f5440'
  on-primary: '#ffffff'
  primary-container: '#56735a'
  on-primary-container: '#f7fff3'
  inverse-primary: '#a3c298'
  secondary: '#5c5550'
  on-secondary: '#ffffff'
  secondary-container: '#e2dcd3'
  on-secondary-container: '#5c5550'
  tertiary: '#545d63'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c767c'
  on-tertiary-container: '#fbfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e7d4'
  primary-fixed-dim: '#bacbb8'
  on-primary-fixed: '#111f13'
  on-primary-fixed-variant: '#3c4a3c'
  secondary-fixed: '#ddd5cb'
  secondary-fixed-dim: '#b8ada0'
  on-secondary-fixed: '#211d19'
  on-secondary-fixed-variant: '#4a443d'
  tertiary-fixed: '#dae4eb'
  tertiary-fixed-dim: '#bec8cf'
  on-tertiary-fixed: '#131d22'
  on-tertiary-fixed-variant: '#3e484e'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
  cream-base: '#FAF9F6'
  sage-muted: '#849483'
  petal-pink: '#E8D5D5'
  mist-blue: '#D1DBE2'
  charcoal-text: '#333732'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0
  DEFAULT: 0.5rem
  md: 0.5rem
  lg: 0.625rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 96px
---

## Brand & Style

This design system embodies the "Synesthetic Light" aesthetic—a sophisticated blend of editorial clarity and ethereal atmosphere. The brand personality is calm, reflective, and deeply personal, targeting a creative audience that values intentionality over noise. 

The visual style is a refined **editorial Minimalism** with a deliberately harder edge. It utilizes expansive white space (in the form of tinted creams) and defined, tonal borders — rather than translucent glass — to create depth through structure, not weight. The interface should feel like a high-end digital gallery: quiet, breathable, and supportive of rich media content. Every interaction stays calm and intentional ("tonal serenity"), but corners are crisp and edges are clearly drawn rather than softly blurred.

## Colors

The palette is anchored by a deepened, more saturated **Sage Green (primary: #3F5440)**, which reads as confident and grounded rather than washed-out. Petal Pink and Mist Blue still exist as rare decorative accents (e.g. data-viz or styleguide swatches), but they no longer carry functional UI — the earlier dusty-rose secondary family read as a wellness-spa palette, which mismatched a sports/travel/wedding photography brand. Secondary is now a warm, neutral **Stone** tone with no pink or blue hue, used for the same structural roles (containers, fixed surfaces) the rose family occupied before.

The background is never pure white, but rather a warm **Cream Base (#FAF9F6)** to reduce eye strain and enhance the "editorial" feel. Secondary and tertiary colors should be used sparingly for accentuation—primarily in decorative elements, subtle highlights, or to differentiate content categories. Text is rendered in **Charcoal Green**, a near-black derived from the primary sage, ensuring high legibility while maintaining the palette's grounded temperature.

## Typography

This design system exclusively uses **Newsreader** for all narrative and display elements to establish a literary, authoritative, and deeply personal voice. The font's variable weights allow for a "thick-to-thin" contrast that mimics ink on paper.

For functional UI elements—such as navigation labels, tags, and small captions—**Inter** is introduced as a utility font. This sans-serif contrast ensures that the editorial "serenity" of the Newsreader headlines is not cluttered by technical metadata. Use high-contrast sizing between display headers and body text to create a clear visual hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for content, centered within a wide viewport to emphasize the "gallery" feel. On desktop, a 12-column grid is used with generous margins (64px) to frame the content. 

A "Breathable Spacing" rule still applies, but tightened for the harder redesign: vertical gaps between sections are ~96px (down from the original 120px+) — airy enough to rest the eye, dense enough to read as a deliberate rhythm rather than floating whitespace. Layouts should often be asymmetrical, pushing content slightly off-center or using "Split" configurations to create dynamic tension between text and media.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **defined borders** rather than traditional shadows or glass blur.
- **Surface 0 (Base):** Cream Base.
- **Surface 1 (Cards / Chrome / Overlays):** Solid, opaque surface tones (`surface` for chrome like header/bottom-bar, `surface-container-lowest` for cards). No transparency, no backdrop blur.
- **Depth:** Use 1px solid borders (`--border-tonal`, drawn in the defined `outline` tone) to frame edges crisply. Drop shadows are avoided on chrome and cards; the **Ambient Shadow** (ultra-diffused, 10% Sage tint) is used on homepage portrait/tile imagery via the `shadow-ambient` utility, paired with sharp (`rounded-none`) corners and a tonal border — shadow for lift, square edge for the "harder" redesign language. Apply `shadow-ambient` on a wrapper *outside* any `overflow-hidden` crop container, since `overflow-hidden` clips an element's own box-shadow.

## Shapes

The shape language is **lightly rounded with a harder edge** — the indie/editorial feel stays, but corners are tightened to read crisp rather than soft. UI components like buttons and input fields use a 0.5rem (8px) radius. Larger containers, such as cards or video players, use the `rounded-xl` (0.75rem/12px) setting — a defined, editorial frame rather than an organic pillow.

## Components

### Video-Loop Components
Video-loops are treated as living textures rather than distinct players. They should be edge-to-edge within their containers, featuring no visible controls (play/pause hidden unless hovered). No pastel tint overlay — footage stays at full contrast (Redesign: the earlier Mist-Blue unification wash was removed, as it softened the imagery against the harder edge direction).

### Split CTAs
Split CTAs divide the container 50/50. One side features a high-quality image or video loop; the other side contains a Newsreader headline and a button. The background of the text side should be a soft tonal variation of the Primary or Secondary colors.

### Buttons & Inputs
- **Primary Button:** Solid `Sage Green` with `Cream` text. Rounded-md.
- **Secondary Button:** Ghost style with a 1px `Outline` border (neutral, not a pastel accent).
- **Input Fields:** Bottom-border only for an editorial look, or fully rounded containers with a 5% opacity `Sage` fill.

### Cards
Cards use solid, opaque surfaces (`surface-container-lowest`) with a defined 1px border (`--border-tonal`) and tightened corners (`rounded-xl` = 12px). Depth comes from the crisp edge, not from frosted blur — keeping the look light but clearly structured.