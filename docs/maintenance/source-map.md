---
type: Reference
title: Source map
description: Which project files each part of this bundle is based on.
tags: [reference, provenance, sources]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: readme
    resource: ../../README.md
    title: grokf – README
  - id: source
    resource: ../../grokf.html
    title: grokf.html – the tool's source
  - id: review
    resource: ../reviews/2026-10-05.md
    title: Security review of grokf (2026-10-05)
  - id: tests
    resource: ../../test/README.md
    title: Test documentation for grokf
---

# Sources

| Source | Used for |
| --- | --- |
| [`README.md`](../../README.md) | Usage, URL parameters, publishing and local browsing |
| [`grokf.html`](../../grokf.html) | The implementation: config, crawling, graph, layout, rendering, the deck and security |
| [`2026-10-05.md`](../reviews/2026-10-05.md) | Security findings, limits and behavior changes |
| [`test/README.md`](../../test/README.md) | The test suite and how to run it |
| [`attachments/favicon.svg`](../design/attachments/favicon.svg) | The project's mascot and favicon, shown in the interface design concept |
| [`favicons/`](../../favicons/) | The favicon and app assets the tool references: the SVG and ICO sources (embedded in the page), `apple-touch-icon`, and `site.webmanifest` with the app name, scope, icons and screenshot |
| [`grokf-sw.js`](../../grokf-sw.js) | The optional service worker that keeps the app shell available offline |
| [`grokf.png`](../../grokf.png) | The wide screenshot declared in the web app manifest |

# Notes

The tool's source is a single HTML file, so the concepts name the functions they rely on rather than line numbers, and they survive edits. Where a claim comes from the implementation rather than from documentation, the concept cites the relevant function. The [Favicon](../design/favicon.md) concept is the exception: it records external web specifications and vendor documentation, cited in its `sources`, rather than project files. All concepts are currently **unverified**, since no `verified` field is set.

# Connections

- [About this bundle](../about-this-bundle.md)

[^readme]: Project README.
[^source]: The tool's source file.
[^review]: Security review, revision 1 to 2-draft.
[^tests]: Test documentation.
