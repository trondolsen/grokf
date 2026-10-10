---
type: Guide
title: Getting started
description: Open a bundle in the viewer, orient in the graph and read your first concept.
tags: [guide, tutorial, getting-started]
okfx:
  decks: [Tour]
sources:
  - id: readme
    resource: ../../README.md
    title: grokf – README
  - id: source
    resource: ../../grokf.html
    title: grokf.html – autoLoad, pickFolder, fromDataTransfer
---

# What you need

A bundle — a folder of Markdown files — and a modern browser. The viewer is one
HTML file with no install, no build step and no server: everything runs in the
browser, and your files are never uploaded.[^readme]

# Steps

1. **Open the viewer.** Use a deployed copy such as the one at `grokf.org`, or
   open `grokf.html` from your own disk. The viewer opens on its **About** panel.
2. **Load a bundle.** On a web server the viewer loads `bundles/` next to the
   page automatically; add `?bundle=<name|path>` to load another one. In a local
   copy nothing auto-loads, so choose **Open folder…** and pick the bundle
   directory, or drag the folder onto the window. The graph fills in as files
   are read, and the About panel stays until you interact with the interface,
   then closes so the graph is unobstructed.[^source]
3. **Find the graph.** Every node is a file, a directory or a tag; the root
   directory is labelled "bundle". The top bar reports the totals, for example
   "24 files · 31 links".
4. **Read a node.** Hover it to see its title, type, path and description in a
   tooltip, then click it to open the page in the preview panel.
5. **Follow a link.** Click a link inside the page to move to the next concept;
   the preview keeps a history you can page back through.

# What you should see

- The **legend** docks at the left, listing each group's colour and count.
- The **filters** dock at the right; they start empty.
- A node with a **dashed ring** has content that is not loaded yet — click it to
  load, then click again to open the preview.

# Next steps

- [Explore the graph](explore-the-graph.md)
- [Find a concept](find-a-concept.md)
- [Read a concept](read-a-concept.md)
- [Open a local folder](../interface/local-folders.md)
- [Publish a bundle on a website](../interface/publishing.md)

[^readme]: Project README, "Usage".
[^source]: `autoLoad`, `pickFolder` and `fromDataTransfer` in the tool source.
