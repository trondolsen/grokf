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
    title: OKF Graph Explorer – README
  - id: source
    resource: ../../okf-graph-explorer.html
    title: okf-graph-explorer.html – the tool's source
  - id: review
    resource: ../reviews/2026-10-05.md
    title: Security review of OKF Graph Explorer (2026-10-05)
  - id: tests
    resource: ../../test/README.md
    title: Test documentation for OKF Graph Explorer
---

# Sources

| Source | Used for |
| --- | --- |
| [`README.md`](../../README.md) | Usage, URL parameters, publishing and local browsing |
| [`okf-graph-explorer.html`](../../okf-graph-explorer.html) | The implementation: config, crawling, graph, layout, rendering and security |
| [`2026-10-05.md`](../reviews/2026-10-05.md) | Security findings, limits and behavior changes |
| [`test/README.md`](../../test/README.md) | The test suite and how to run it |

# Notes

The tool's source is a single HTML file, so the concepts name the functions they rely on rather than line numbers, and they survive edits. Where a claim comes from the implementation rather than from documentation, the concept cites the relevant function. All concepts are currently **unverified**, since no `verified` field is set.

# Connections

- [About this bundle](../about-this-bundle.md)

[^readme]: Project README.
[^source]: The tool's source file.
[^review]: Security review, revision 1 to 2-draft.
[^tests]: Test documentation.
