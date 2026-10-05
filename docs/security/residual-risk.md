---
type: Reference
title: Residual risk
description: Known limits of the protections and the browser checks that remain before release.
tags: [security, risk, limitations, verification]
okfx:
  mode: explanation
  version: praxis/1
sources:
  - id: review
    resource: ../reviews/2026-10-05.md
    title: Security review of OKF Graph Explorer (2026-10-05)
---

# Why some risk remains

The protections bound what the tool does, not what the browser or the platform does. The review therefore lists risk that the fixes do not remove.[^review]

# Known limits

- **Inline script.** A single-file tool must keep its inline application script. `script-src-attr 'none'` adds protection against event attributes, but its support and effect still need checking in the target browsers; a script hash is a further option.
- **Decoders.** Image limits bound compressed bytes, not decoded pixels, so the browser's image and SVG decoders remain part of the trust base.
- **Chunk allocation.** Streaming limits retained content, but the browser or the decompression engine can allocate a chunk before JavaScript checks it.
- **Server mapping.** URL containment constrains addresses, not the server's mapping from URL to file. Symlinks, rewrites and misconfiguration must be handled on the server, and a dedicated static origin is preferred.
- **No memory promise.** A combined byte limit is not a guarantee of low memory use for every allowed graph.

# Checks that remain

The passing tests use a mocked network and parts of the DOM and layout startup, so actual browser behaviour, CSP enforcement and network traffic are still unverified. The review leaves these browser checks open:[^review]

- [ ] The marker payloads create no event attributes and do not change the document title.
- [ ] The network panel shows no requests outside the bundle root or forwarded redirects.
- [ ] Local images work; external, data and raw blob images trigger no loading.
- [ ] Normal crawling, depth limiting, local attachments, SVG images, footnotes and navigation work.
- [ ] Oversized streams, PDFs, decompression results and bundles are rejected within the limits.
- [ ] Switching bundles during active requests shows no earlier images, text or metadata.
- [ ] A graph-limit failure leaves the previous bundle usable and allows a new attempt once the cause is removed.

# Connections

- [Untrusted bundles](../principles/untrusted-bundles.md)
- [Limits and budgets](limits-and-budgets.md)
- [Test suite](../maintenance/test-suite.md)

[^review]: Security review, "Residual risk and further control", "Verification" and "Behavior changes".
