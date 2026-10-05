---
type: Algorithm
title: Force layout
description: A d3-force-style simulation with Barnes-Hut repulsion, link and radial forces, and grid collision, run on a canvas.
tags: [algorithm, layout, simulation, canvas]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: source
    resource: ../../okf-graph-explorer.html
    title: okf-graph-explorer.html – the forces, integrate and draw sections
---

# Context

The graph is drawn on an HTML canvas with no charting library. Node positions are found by a continuous **force simulation** in the style of `d3-force`, written from scratch.[^source]

# Forces

The simulation accumulates acceleration from several forces:[^source]

- **Many-body repulsion** between all nodes, approximated with a Barnes-Hut quadtree so the cost stays near `O(n log n)` instead of `O(n²)`.
- **Link forces** that pull connected nodes together, with different strengths for tree, reference and tag links.
- A weak **radial** force that gives the tree a ring structure by depth.
- A **collision** force that prevents overlap, using a uniform grid.
- A weak **centering** force.

# Integration

Velocities are updated with a velocity-Verlet step and clamped to a maximum speed and acceleration. A cooling factor `alpha` decays each tick and never drops below a floor, so the layout keeps a slow, continuous motion instead of freezing.

# Trade-offs

A continuous simulation keeps the graph alive and self-organising, but it costs CPU on every frame and never becomes pixel-stable. The tool therefore keeps the view framed while a fresh layout settles, and can skip animation when the user prefers reduced motion.

# Connections

- [Graph construction](graph-construction.md)
- [Graph model](../model/graph-model.md)
- [Local processing](../principles/local-processing.md)

[^source]: The forces, integrate and draw sections of the tool source.
