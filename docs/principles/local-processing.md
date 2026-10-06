---
type: Principle
title: Local processing
description: All bundle processing happens in the browser; files never leave the machine.
tags: [principle, offline, privacy, static-hosting]
okfx:
  mode: explanation
  version: praxis/1
sources:
  - id: readme
    resource: ../../README.md
    title: grokf – README
  - id: overlay
    resource: ../../grokf.html
    title: grokf.html – overlay text and about panel
---

# Principle

The tool reads, parses, renders and lays out a whole bundle **in the browser**. There is no backend, no build step and no runtime dependency: one HTML file holds the CSS, the JavaScript and the renderer.[^readme] Files chosen from disk are read locally and are not uploaded anywhere.

# Why it matters

- The tool can be published as a single static file, for example on GitHub Pages, and it works offline over `file://`.[^readme]
- Sensitive or private bundles stay on the machine.
- There is no server to trust with the bundle's contents; the browser is the only execution environment.

# Consequences

Because there is no server, there is also no server-side validation, search index or cache. The tool must do all work in JavaScript, and it must tolerate bundles that are large, malformed or hostile. That constraint leads to [untrusted bundles](untrusted-bundles.md) and to the explicit [limits and budgets](../security/limits-and-budgets.md).

# Connections

- [Untrusted bundles](untrusted-bundles.md)
- [URL parameters](../interface/url-parameters.md)
- [Publishing](../interface/publishing.md)

[^readme]: Project README, "Usage".
