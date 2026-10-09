---
type: Reference
title: Declared decks
description: How a bundle declares decks in frontmatter, and how the viewer builds them when the bundle loads.
tags: [interface, deck, frontmatter, okfx]
okfx:
  mode: reference
  version: praxis/1
  decks:
    - name: Tour
      pages:
        - docs/guides/getting-started.md
        - docs/guides/explore-the-graph.md
        - docs/guides/find-a-concept.md
        - docs/guides/read-a-concept.md
        - docs/guides/controls.md
        - docs/guides/troubleshooting.md
        - docs/guides/install-as-web-app.md
    - name: Model
      pages:
        - docs/model/bundle-and-concept.md
        - docs/model/graph-model.md
        - docs/model/okf-tutorial.md
        - docs/model/chapters.md
sources:
  - id: source
    resource: ../../grokf.html
    title: grokf.html – applyBundleDecks, resolveDeclaredPath
---

# What it is

A bundle can ship **decks**: the viewer builds them when the bundle loads, in
place of the empty default deck. Each deck names its pages, so a reader opens the
bundle with a reading list already assembled.[^source]

# Frontmatter

A concept declares decks under the OKF Praxis extension key `okfx.decks`, a list
of decks with a name and pages:

```yaml
okfx:
  decks:
    - name: Tour
      pages: [docs/guides/getting-started.md, docs/guides/explore-the-graph.md]
    - name: Model
      pages:
        - docs/model/bundle-and-concept.md
        - docs/model/graph-model.md
```

- Any concept may declare `okfx.decks`; the viewer collects every declaration from
  the loaded concepts and builds the decks in that order.
- `name` is optional; without it a deck is named "Deck 1", "Deck 2" and so on.
- Each page is a path to a concept, resolved like other frontmatter paths: a bare
  or `/`-prefixed path is relative to the bundle root, a `./` or `../` path is
  relative to the file, and the `.md` extension is optional.
- A page that is not a loaded concept is skipped, and at most eight decks are
  built. Decks live in memory only, so editing one in the interface lasts until
  the bundle is loaded again.

# This bundle's decks

This concept declares two decks, from its own frontmatter: a **Tour** of the user
guides in reading order, and a **Model** deck of the model concepts. A reader who
opens the bundle finds both in the deck panel.

# Connections

- [Deck of cards](deck.md)
- [Interface](index.md)
- [Deck of cards (design)](../design/deck.md)

[^source]: `applyBundleDecks` and `resolveDeclaredPath` in the tool source.
