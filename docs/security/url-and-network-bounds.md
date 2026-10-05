---
type: Protocol
title: URL and network bounds
description: Rules that keep every request same-origin and inside the declared bundle root, with no credentials or redirects.
tags: [security, url, same-origin, network]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: review
    resource: ../reviews/2026-10-05.md
    title: Security review of OKF Graph Explorer (2026-10-05)
  - id: source
    resource: ../../okf-graph-explorer.html
    title: okf-graph-explorer.html – normalizeLinkPath, urlWithinBundle, trackedFetch
---

# Rules

Every URL the tool loads passes through the same checks before any request is made:[^source][^review]

- **Same origin only.** The URL's origin must equal the page's origin, and the scheme must be `http:` or `https:`.
- **Inside the bundle root.** The URL path must start with the root path, which must end in `/`; neither the root nor the URL may carry a username, password, query or fragment.
- **No encoded separators.** Paths containing an encoded `/`, `\` or `%` are rejected.
- **No traversal or schemes.** Backslashes, control characters, absolute paths and non-http schemes are rejected in internal references.
- **No redirects and no credentials.** Fetch uses `credentials: "omit"` and `redirect: "error"`, so a response cannot bounce the request to another host.

# Effect

A malicious bundle cannot probe other hosts, read another origin, or smuggle a different resource in through a redirect. Images follow the same rules; external and `data:` images are not shown, and valid bundle images are displayed from blob URLs.[^review]

# Limits of the control

The rules constrain URLs, not the server's mapping from URLs to files. Symlinks, internal rewrites and a misconfigured deploy must be handled on the server. Prefer a dedicated static origin without sensitive routes.

# Connections

- [Untrusted bundles](../principles/untrusted-bundles.md)
- [Crawling](../algorithms/crawling.md)
- [Publishing](../interface/publishing.md)
- [Bounded streaming and reserved capacity](streaming-and-budgets.md)

[^source]: `normalizeLinkPath`, `urlWithinBundle`, `bundleUrl` and `trackedFetch` in the tool source.
[^review]: Security review, finding A2 and "Limits of the control".
