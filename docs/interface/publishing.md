---
type: Workflow
title: Publish a bundle on a website
description: Steps to serve a bundle and link to it, and the trade-off with lazy crawling for larger bundles.
tags: [workflow, publishing, static-hosting, how-to]
okfx:
  mode: how-to
  version: praxis/1
sources:
  - id: readme
    resource: ../../README.md
    title: grokf – README
---

# Goal

Serve the explorer and one or more bundles from a static site, for example GitHub Pages.[^readme]

# Steps

1. Include `grokf.html` in the website.
2. Add a link to `grokf.html?bundle={relative-path-to-bundle}/`.
3. Publish the site. The page and the bundle must be served from the same origin.

# Trade-off

Bundle pages are crawled lazily, so publishing is recommended for **small** bundles. A large bundle means many requests and a longer load. Use `?depth=N` to prefetch fewer levels and let the user reveal the rest on demand.[^readme]

# Notes

- Bundles are discovered from `index.md` by following links; there is no manifest.
- Requests omit credentials and reject redirects, so a bundle behind authentication, HTTP credentials or redirects will not load. Use plain static hosting rather than removing the URL controls.[^readme]

# Connections

- [URL parameters](url-parameters.md)
- [Local processing](../principles/local-processing.md)
- [URL and network bounds](../security/url-and-network-bounds.md)

[^readme]: Project README, "Publish on website".
