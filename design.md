---
name: Creative Professionalism
colors:
  surface: '#fef7ff'
  surface-dim: '#dfd7e6'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f1ff'
  surface-container: '#f3ebfa'
  surface-container-high: '#ede5f4'
  surface-container-highest: '#e8dfee'
  on-surface: '#1d1a24'
  on-surface-variant: '#4a4455'
  inverse-surface: '#332f39'
  inverse-on-surface: '#f6eefc'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#b4136d'
  on-secondary: '#ffffff'
  secondary-container: '#fd56a7'
  on-secondary-container: '#600037'
  tertiary: '#7d3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a15100'
  on-tertiary-container: '#ffe0cd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#ffd9e4'
  secondary-fixed-dim: '#ffb0cd'
  on-secondary-fixed: '#3e0022'
  on-secondary-fixed-variant: '#8c0053'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb784'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#fef7ff'
  on-background: '#1d1a24'
  surface-variant: '#e8dfee'
typography:
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The brand personality is a fusion of high-end corporate reliability and vibrant creative energy. This design system targets creators, marketers, and entrepreneurs who require a frictionless, professional environment that doesn't sacrifice visual inspiration.

The style is defined as **Corporate Modern with Glassmorphic accents**. It utilizes high-quality whitespace and a systematic approach to density while incorporating translucent layers and subtle blurs within the editor environment to keep the focus on the user's canvas. The aesthetic is "Editor-First," meaning the interface recedes to let the creative work shine, using deep navy surfaces for toolsets to minimize visual interference.

## Colors

The palette is anchored by a high-energy **Primary Purple**, used for navigation and primary actions. A **Secondary Pink** is employed as a complimentary tone for marketing highlights and interactive states. Together, these colors form the signature "Creative Gradient" used for high-impact calls to action.

The **Accent Amber** is strictly reserved for "Pro" tier features, monetization prompts, and premium assets, ensuring a clear value hierarchy. Neutral surfaces are bifurcated: a bright, airy light mode for administrative tasks (dashboard, settings) and a sophisticated **Dark Surface** for the editor workspace to maximize color accuracy and reduce eye strain during design sessions.

## Typography

This design system utilizes **Inter** across all levels to maintain a utilitarian and systematic feel. The type scale is built on a modular rhythm to ensure legibility in data-dense toolbars.

Headlines use tighter letter spacing and heavier weights to create a strong visual anchor, while body copy is optimized for readability with generous line heights. Small labels and captions are often set in Medium (500) weight to maintain clarity at smaller scales, especially within the dark-themed editor panels.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid hybrid grid**. Dashboards and marketing pages utilize a 12-column fixed grid centered on the screen, while the editor workspace is fluid, expanding to occupy all available screen real estate.

Spacing is strictly governed by an **8px base unit**. All margins, paddings, and component heights must be multiples of 8 (e.g., 16, 24, 32). This ensures a predictable vertical rhythm and perfectly aligned toolbars within the design interface. Gutters are set to 24px to provide enough breathing room between functional panels.

## Elevation & Depth

Visual hierarchy is conveyed through **Tonal Layers** and **Ambient Shadows**. In the light-themed dashboard, surfaces are differentiated by subtle shifts from White to Light Gray, with shadows used sparingly for floating elements like dropdowns or popovers.

Within the editor, depth is achieved via **Glassmorphism**. Overlays and floating toolbars use a 20px backdrop blur with a 10% white border to separate tools from the design canvas. Shadows are extra-diffused (24px blur) with a low-opacity navy tint (#1E1E2E) rather than pure black, maintaining a soft, modern feel even in the dark mode environment.

## Shapes

The shape language is "Functional-Soft." It avoids the extreme playfulness of fully pill-shaped components in favor of structured, modern geometric forms that feel professional. 

Specific corner treatments are mandatory:
- **Inputs & Buttons:** 8px radius to provide a precise, clickable feel.
- **Cards & Content Containers:** 12px radius to soften the presentation of creative assets.
- **Modals & Dialogs:** 16px radius for a distinct, surfaced appearance that commands attention.
Icons and small UI glyphs should use a 2px stroke and slightly rounded terminals to match the font's geometry.

## Components

### Buttons
- **Primary:** Features a linear gradient from Primary Purple to Secondary Pink (45-degree angle).
- **Secondary:** White background with a 1px border using the Primary Purple.
- **Pro:** Solid Amber background with white text, always accompanied by a "Crown" icon.

### Input Fields
- Height set to 40px (large) or 32px (small/compact).
- 8px border radius.
- 1px border (#E5E7EB) that transitions to Primary Purple on focus.

### Cards
- 12px border radius.
- Subtle 1px border in Light Gray.
- Hover state: Lift effect using a 12px ambient shadow and a slight scale increase (102%).

### Modals
- 16px border radius.
- Centered on screen with a high-blur (10px) dark overlay.
- Header sections use a Subtle Gray background to separate titles from body content.

### Selection Controls
- Checkboxes and Radios use Primary Purple for the "Checked" state.
- Switches utilize a smooth transition with the Secondary Pink indicating the "On" state.

### Editor Toolbars
- Dark Surface (#1E1E2E) with 80% opacity and 20px backdrop blur.
- High-contrast white icons for maximum visibility.
- Active tools highlighted with a Primary Purple background and 4px radius indicator.