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
  on-surface-variant: '#434842'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#747872'
  outline-variant: '#c4c8c0'
  surface-tint: '#536253'
  primary: '#516051'
  on-primary: '#ffffff'
  primary-container: '#697969'
  on-primary-container: '#f7fff3'
  inverse-primary: '#bacbb8'
  secondary: '#695b5b'
  on-secondary: '#ffffff'
  secondary-container: '#eedbdb'
  on-secondary-container: '#6d5f5f'
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
  secondary-fixed: '#f1dede'
  secondary-fixed-dim: '#d5c2c2'
  on-secondary-fixed: '#231919'
  on-secondary-fixed-variant: '#504444'
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
    fontWeight: '300'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '300'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
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
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

This design system embodies the "Synesthetic Light" aesthetic—a sophisticated blend of editorial clarity and ethereal atmosphere. The brand personality is calm, reflective, and deeply personal, targeting a creative audience that values intentionality over noise. 

The visual style is a refined mix of **Minimalism** and **Glassmorphism**. It utilizes expansive white space (in the form of tinted creams) and translucent overlays to create a sense of depth without weight. The interface should feel like a high-end digital gallery: quiet, breathable, and supportive of rich media content. Every interaction should evoke a sense of "tonal serenity," using soft transitions and a light-diffused UI to mimic the quality of natural morning light.

## Colors

The palette is anchored by a base of **Sage Green (#849483)**, which provides an organic, grounded focal point. This is supported by a series of synesthetic pastels: **Petal Pink** and **Mist Blue**. 

The background is never pure white, but rather a warm **Cream Base (#FAF9F6)** to reduce eye strain and enhance the "editorial" feel. Secondary and tertiary colors should be used sparingly for accentuation—primarily in decorative elements, subtle highlights, or to differentiate content categories. Text is rendered in **Charcoal Green**, a near-black derived from the primary sage, ensuring high legibility while maintaining the palette's soft temperature.

## Typography

This design system exclusively uses **Newsreader** for all narrative and display elements to establish a literary, authoritative, and deeply personal voice. The font's variable weights allow for a "thick-to-thin" contrast that mimics ink on paper.

For functional UI elements—such as navigation labels, tags, and small captions—**Inter** is introduced as a utility font. This sans-serif contrast ensures that the editorial "serenity" of the Newsreader headlines is not cluttered by technical metadata. Use high-contrast sizing between display headers and body text to create a clear visual hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for content, centered within a wide viewport to emphasize the "gallery" feel. On desktop, a 12-column grid is used with generous margins (64px) to frame the content. 

A "Breathable Spacing" rule is applied: vertical gaps between sections should be significant (120px+) to allow the user's eyes to rest. Layouts should often be asymmetrical, pushing content slightly off-center or using "Split" configurations to create dynamic tension between text and media.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Blurs** rather than traditional shadows.
- **Surface 0 (Base):** Cream Base.
- **Surface 1 (Cards/Overlays):** Semi-transparent white (80% opacity) with a 16px backdrop blur (Glassmorphism).
- **Depth:** Instead of drop shadows, use 1px solid borders in a slightly darker shade of the background color (e.g., Mist Blue or Sage) to define edges. If a shadow is necessary for interactive elements, it must be an **Ambient Shadow**: ultra-diffused, 10% opacity, tinted with the Primary Sage green.

## Shapes

The shape language is **Rounded**, reflecting the soft nature of the pastel palette. UI components like buttons and input fields use a 0.5rem (8px) radius. Larger containers, such as cards or video players, should use the `rounded-xl` (1.5rem/24px) setting to create a friendly, organic frame for the "Synesthetic Light" visuals.

## Components

### Video-Loop Components
Video-loops are treated as living textures rather than distinct players. They should be edge-to-edge within their containers, featuring no visible controls (play/pause hidden unless hovered). Apply a subtle `Mist Blue` tint overlay (10-15%) to videos to unify them with the pastel brand color space.

### Split CTAs
Split CTAs divide the container 50/50. One side features a high-quality image or video loop; the other side contains a Newsreader headline and a button. The background of the text side should be a soft tonal variation of the Primary or Secondary colors.

### Buttons & Inputs
- **Primary Button:** Solid `Sage Green` with `Cream` text. Rounded-md.
- **Secondary Button:** Ghost style with a 1px `Mist Blue` border.
- **Input Fields:** Bottom-border only for an editorial look, or fully rounded containers with a 5% opacity `Sage` fill.

### Cards
Cards should utilize the Glassmorphism style—frosted backgrounds with blurred content behind them. This allows the pastel background gradients or videos to bleed through the UI, maintaining the synesthetic experience.