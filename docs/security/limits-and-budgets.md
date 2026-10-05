---
type: Reference
title: Limits and budgets
description: The concrete caps on files, bytes, graph size, references, images and decompression work.
tags: [security, limits, budgets, reference]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: review
    resource: ../reviews/2026-10-05.md
    title: Security review of OKF Graph Explorer (2026-10-05)
  - id: source
    resource: ../../okf-graph-explorer.html
    title: okf-graph-explorer.html – the config constants
---

# Limits

The tool enforces these caps while loading and rendering a bundle:[^review]

| Area | Limit |
| --- | --- |
| Text file | 512 KiB before full buffering |
| Bundle | 2 000 files and 32 MiB of text bytes |
| Directory listing / graph node | 8 000 |
| Local directory depth | 12; deeper trees are rejected |
| Stored file path | 2 048 characters and 24 path segments |
| Graph links | 20 000 |
| References from a Markdown body | 256 per file; frontmatter `sources` has its own limit of 256 |
| Tags | 64 per file, at most 256 characters and 16 namespace segments per tag |
| HTTP | 4 concurrent requests through body reading; at most 64 pending; 30-second timeout after a slot is granted |
| Crawling / new expansion attempts | at most 2 000 URLs per crawl and 2 000 expansion attempts per bundle |
| Markdown preview | 512 Ki characters in, 2 Mi characters of HTML out, nesting 24 and bounded search work |
| Images | 8 MiB per image, 16 MiB cache including reservations, 64 images per preview |
| Local PDF | whole files up to 16 MiB; otherwise 2 MiB windows from the start and end |
| HTTP PDF | 512 KiB per start and end response, whether or not the server honours Range |
| PDF decompression | 8 MiB of object-stream text including delimiters; at most 200 streams attempted |

# What the limits do and do not guarantee

The bounds limit raw content and the records held in the structures above. They are **not** a guarantee of a specific maximum heap or CPU use in the browser, and the image limits bound compressed bytes, not decoded pixels.[^review]

# Behaviour

Reaching a limit rejects the load or the growth with a message, and keeps any previously loaded bundle usable. Some features change as a result: very large local files are skipped, a large HTTP PDF on a server without Range support may have no metadata, and external and data-URI images do not load.[^review]

# Connections

- [Untrusted bundles](../principles/untrusted-bundles.md)
- [Markdown preview](../algorithms/markdown-preview.md)
- [URL and network bounds](url-and-network-bounds.md)
- [Bounded streaming and reserved capacity](streaming-and-budgets.md)
- [Residual risk](residual-risk.md)

[^review]: Security review, "Limits in revision 2-draft" and "Behavior changes".
[^source]: The `MAX_*` constants in the tool source.
