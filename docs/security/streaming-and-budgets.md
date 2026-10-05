---
type: Algorithm
title: Bounded streaming and reserved capacity
description: How reads stay bounded while streaming, how budgets are reserved and released, and how fetch slots are held.
tags: [security, streaming, budgets, fetch, decompression]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: review
    resource: ../reviews/2026-10-05.md
    title: Security review of OKF Graph Explorer (2026-10-05)
  - id: source
    resource: ../../okf-graph-explorer.html
    title: okf-graph-explorer.html – readBoundedStream, trackedFetch, fetchBundleText, inflateDeflate
---

# Problem

A stream can deliver more data than expected, so buffering a whole response before checking its size lets an attacker allocate memory first and measure later. The same applies to decompressed PDF object streams.[^review]

# Steps

1. **Read under a byte limit.** `readBoundedStream` pulls bytes from a stream and stops at the limit, with a timeout, instead of accumulating an unbounded buffer.[^source]
2. **Check before decompressing.** `inflateDeflate` decompresses object streams through the same bounded reader, and all included streams and delimiters share one limit. An oversized stream is discarded without keeping partial text.[^review]
3. **Reserve capacity up front.** Parallel text and image reads reserve bytes and file slots before reading, and release any reservation they do not use.[^review]
4. **Hold the fetch slot through the body.** A slot from the concurrency semaphore is held while the body is read or the request is cancelled, not released when the headers arrive.[^review]

# Invariants

- No content is buffered beyond its area's byte limit.
- Reserved capacity is released exactly once, whether the read succeeds, fails or is cancelled.
- At most the configured number of requests are in flight through body reading.

# Failure modes

A read that exceeds a limit is rejected, and the load or growth is rolled back so the previous bundle stays usable. Cancellation, for example on a bundle switch, releases the slot and any reservation.[^review]

# Connections

- [Limits and budgets](limits-and-budgets.md)
- [URL and network bounds](url-and-network-bounds.md)
- [Resource lifecycle](resource-lifecycle.md)

[^review]: Security review, findings A4 and A5.
[^source]: `readBoundedStream`, `inflateDeflate`, `fetchBundleText` and `trackedFetch` in the tool source.
