---
type: Algorithm
title: Crawling
description: Breadth-first link crawl from an entry point, with a depth limit, 404 fallbacks and same-origin bounds.
tags: [algorithm, crawling, depth, links]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: source
    resource: ../../okf-graph-explorer.html
    title: okf-graph-explorer.html – crawlFromUrl, filterByDepth
  - id: readme
    resource: ../../README.md
    title: OKF Graph Explorer – README
---

# Problem

Given one entry file, find the set of concept files reachable through Markdown links, without a manifest and without leaving the bundle.

# Steps

1. Put the **start file**, `index.md` by default, in a queue at depth 0.[^source]
2. Take the next URL, decode it to a bundle-relative path, and reject it unless it is a valid bundle path and a Markdown file (the crawl loads only Markdown).
3. Fetch the file within the byte budget. A `404` triggers a **fallback**: try the next candidate path for the same link.
4. Extract links from the text. For each Markdown target, resolve candidate paths and schedule the first reachable one at depth + 1, keeping the rest as fallbacks. Links to non-Markdown files are not scheduled; they become on-demand nodes.
5. Stop when the queue is empty, or skip scheduling links beyond the **depth limit** set by `?depth=N`; the default is all levels.[^readme]

# What the crawl loads

Only Markdown files are fetched and followed. Any other referenced file — non-Markdown text or a binary attachment — is not fetched; it appears as an unloaded placeholder node and is loaded on click. The crawl therefore stays bounded to the Markdown graph.[^source]

# Invariants

- Only same-origin URLs inside the declared bundle root are fetched; a link that escapes the root is never scheduled.
- The crawl is breadth-first, so the reported depth is the number of link hops from the start.
- Every scheduled URL is visited once; candidates that fail are replaced by their alternatives, not retried forever.

# Failure modes

A link to a file that does not exist is only resolved if an alternative candidate works. If the byte or file limit is reached, the crawl stops with an error instead of returning a partial bundle. Dot-directories are skipped. See [URL and network bounds](../security/url-and-network-bounds.md) and [limits and budgets](../security/limits-and-budgets.md).

# Local folders

A folder opened locally cannot be crawled over the network. The tool reads the Markdown files and applies the same idea in memory: `filterByDepth` keeps files within the depth limit, and the rest stay available for on-demand reveal. Non-Markdown files are read only when opened, like attachments. See [local folders](../interface/local-folders.md).

# Connections

- [Link-driven discovery](../principles/link-driven-discovery.md)
- [Graph construction](graph-construction.md)
- [URL parameters](../interface/url-parameters.md)

[^source]: `crawlFromUrl` and `filterByDepth` in the tool source.
[^readme]: Project README, "URL parameters".
