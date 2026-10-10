---
type: Interface
title: URL parameters
description: The bundle, start and depth query parameters, their values and defaults.
tags: [interface, url, configuration]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: readme
    resource: ../../README.md
    title: grokf – README
  - id: source
    resource: ../../grokf.html
    title: grokf.html – urlParam, resolveBundleLoc, autoLoad
---

# Parameters

They are optional; append to the URL and combine as needed, for example `?bundle=acme/&depth=1`.[^readme]

| Parameter | Values | Default | Meaning |
| --- | --- | --- | --- |
| `bundle` | name, path, or a `*.md` file | `bundles/` next to the page | Bundle to load; a bare name resolves to `bundles/<name>/`. |
| `start` | a file inside the bundle | `index.md` | Crawl entry point. |
| `depth` (or `levels`) | `0` to `n`, or `all` | `all` | Link levels to prefetch. Nodes with unloaded content show a dashed ring and load on click. |

# Rules

- `bundle` and `start` must be **same-origin**; a value pointing elsewhere is rejected with a message.[^source]
- A bare `bundle` name without `/`, and not ending in `.json`, resolves under `bundles/`. A value ending in `.md` is treated as the start file itself.
- `start` is only honoured while it stays inside the bundle folder; otherwise the tool falls back to `index.md`.[^source]
- With no parameters on a web server, the tool tries `bundles/index.md`, then `index.md` beside the page. On `file://` it does not auto-load; the About panel is shown and **Open folder…** in the toolbar opens a local folder instead.[^readme]
- The graph fills in as the crawl loads files, growing in place rather than appearing all at once; see [crawling](../algorithms/crawling.md).
- A `lang` parameter is no longer supported: the language is chosen in the picker and remembered in the browser, and any leftover `lang` in a URL is dropped on load. See [Languages](languages.md).

# Connections

- [Publishing](publishing.md)
- [Local folders](local-folders.md)
- [Languages](languages.md)
- [Crawling](../algorithms/crawling.md)

[^readme]: Project README, "URL parameters".
[^source]: `urlParam`, `resolveBundleLoc` and `autoLoad` in the tool source.
