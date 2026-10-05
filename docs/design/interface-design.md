---
type: Reference
title: Interface design
description: The tool's visual language, covering the dark theme, the toolbar and docks, shared component styling and accessibility cues.
tags: [design, ui, css, accessibility, theme]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: source
    resource: ../../okf-graph-explorer.html
    title: okf-graph-explorer.html – inline CSS and UI
  - id: readme
    resource: ../../README.md
    title: OKF Graph Explorer – README
---

# Overview

The interface is plain inline CSS inside the single HTML file; there is no stylesheet, framework or theme build. It is a fixed dark UI drawn over the graph canvas. Because the CSS ships with the code, this concept is where the visual language is kept current when the interface changes.[^source]

# Theme

One dark theme, defined as CSS custom properties on `:root`: a page background, two panel surfaces, a line colour, text and muted text, and an accent. Node colours (directories, index files, files, attachments, tag hubs and concept types) are separate constants in the script. There is no light theme and no theme switch.[^source]

# Layout

- A full-viewport canvas holds the graph.
- A floating top bar holds pill-shaped groups: the title and stats, file actions, view and toggle actions, and directory navigation.
- A filter sidebar docks right, the legend docks left, and the preview and loading overlays sit above the canvas. The legend lists each node kind and concept type with a colour swatch and count. Clicking a row filters the graph to that group and greys the other rows without removing them, so clicks combine additively and clicking again clears one. Hovering a row highlights that group with the same cue used when hovering a node; while a filter is active the hover adds the hovered group to the selection instead of replacing it, so the standing selection and the hovered group are highlighted together. The list is rebuilt when a directory is entered or a tag filter changes, dropping selections whose group is no longer present.
- Below 760px the bar stacks vertically, the extra groups collapse behind a hamburger, and the side panels dock and slide behind tabs.[^source]

# Components

Shared styling keeps the controls consistent:[^source]

- Buttons share one base rule (surface, border, radius, padding); hover promotes the border to the accent colour.
- Groups are translucent, blurred pills that hold related controls.
- Toggle buttons (Labels and Tags) carry their state in `aria-pressed`. The **on** state is the normal label; the **off** state dims the label to a shade only slightly lighter than the button surface, rather than tinting the button fill.
- The title control and the mobile hamburger use the same vertical box model as the nav buttons, so every top-bar pill has the same height.
- Legend rows carry horizontal padding, so the hover and selected highlight boxes enclose the swatch, label and count with even space on both sides.

# Favicon and mascot

The page declares an SVG favicon as an inline `data:` URI, keeping the single-file format: the tool never loads `data:` images from bundle content, so the favicon is the only inline image. The CSP therefore allows `blob:` and `data:` for `img-src`. The figure is the project's **mascot**: a stick figure in a victory pose whose nodes follow the graph vocabulary — the torso is the root directory, the head, shoulder, elbows and hands are concepts, the knees and feet are files, and each arm and leg is drawn as two links. It is drawn inline in the About panel and the bundle load dialog, and kept as [`attachments/favicon.svg`](attachments/favicon.svg) for documentation.[^source]

![OKF Graph Explorer mascot](attachments/favicon.svg)

# Accessibility

State is carried by attributes, not colour alone where it matters: `aria-pressed` on the toggles, `aria-expanded` on the title, labelled inputs, and a reduced-motion fallback for the loading spinner. Panels are reachable by keyboard, and external links open with `rel="noopener noreferrer"`.[^source]

# Guidance

Keep the single-file, dependency-free approach and reuse the CSS custom properties instead of ad-hoc colours. Prefer expressing component state with ARIA attributes so the visual cue follows the semantics. Update this concept when the theme, layout, components or accessibility cues change.

# Connections

- [Interface](../interface/index.md)
- [Local processing](../principles/local-processing.md)
- [About this bundle](../about-this-bundle.md)

[^source]: The tool's inline CSS and UI in `okf-graph-explorer.html`.
[^readme]: Project README.
