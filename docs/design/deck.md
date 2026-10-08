---
type: Reference
title: Deck of cards
description: The floating right-edge deck of small page cards, their drop placement and hover shuffle, the page screenshots and the guide sub-decks.
tags: [design, deck, cards, interface, layout]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: source
    resource: ../../grokf.html
    title: grokf.html – the deck section
---

# Overview

The **deck** is an optional set of cards on the right edge that holds pages. It is built from the graph or the preview, and it stays out of the way until it has a card. The deck has **no panel**: the cards float over the canvas with only their shadows. A tiny, panel-tab-like **title chip** is stuck to the active deck's **current top page** — a child of the first card, sitting on top of it just above its top edge — so it rides that card when the stack shuffles and follows whichever page becomes the top. It names the **most prominent kind** among the pages the deck holds (the kind that appears on the most cards). A long kind is abbreviated to keep the chip small, with its full name shown on hover. A second chip, hanging under the deck's **bottom page** and aligned to the right side, names the **most prominent tag** among those pages (the tag on the most cards). Each chip highlights while the page it belongs to is pointed at. Beside it, a separate **fixed-size** drop site marks where a dragged card lands: it does not resize with the deck, reaches from near the top of the window down near its bottom, and is shown for the whole drag (whether the deck is empty or already holds cards). Several decks can be kept at once: each is a separate **stack** in the panel, set apart by a gap, with the **active** one live and the rest dimmed. The deck is the only place where several pages are shown together at once.

# Cards

A card is a small, **A4-proportioned** portrait slip that shows one whole page, and nothing else:[^source]

- The **screenshot** of the page's top-left, at the normal preview size, filling the card; there is no header.
- A **remove** button (`×`) and, for a sub-deck, an expand chevron — bare glyphs over the page image that appear on card hover; the remove button just reddens its glyph on hover (no highlight), while the chevron gains a round accent highlight.
- Clicking a card opens the page in the full preview.

The card dragged from a node is a **real card**, not a simplified stand-in, so it looks identical to a docked card while it is moved. It keeps following the pointer for the whole drag and only docks when it is released. On touch, the press-hold that starts the grab also suppresses the browser's context menu on the canvas, so a long press cannot interrupt the drag.

# Placement and hover

Cards sit in tightly spaced vertical slots, so they overlap down to a header strip, and a dropped page **snaps** into the slot nearest where it was released. Each card's stacking order follows its slot, so a card covers the one above it and is covered by the one below.

Hovering a card **shuffles** the deck vertically: the cards above it nudge up and the cards below it nudge down, so they part around it. The hovered card keeps its place in the stacking order rather than being raised, so it never covers the pages below it. It gains an accent glow, and the highlight is kept while the pointer stays anywhere in the deck — the cards do not fill its column, so the gaps between them do not drop it, and only leaving the deck resets the stack. The shuffle is vertical only.

While a page is **dragged** over the decks, the dragged card **keeps following the pointer** and is not docked until it is released. A separate, fixed-size drop site is shown for the whole drag: it is dim while the card is outside it and **lightens while the card is inside it**, so the drop site is always visible and reads as active when it can receive the card. While the card is inside the drop site, the docked decks **scroll** as the pointer nears the panel's top or bottom, or with the wheel, so a deck scrolled out of view can still be reached. The card lands in whichever deck's stack the pointer is over, and takes the **stacking order of the slot it would land in** in that stack, so the pages below that slot cover it and the pages above it stay behind — the dragged card reads as being in that deck while it still tracks the pointer. Those pages also **shift down one step**, opening its place. A drag owns the deck while it lasts, so hovering cannot shuffle the stack under it.

A release **clear of every stack** — in the deck's column but not over any deck, for example in the gap between two decks — does not join a deck: it starts a **new deck** holding just that page, which becomes the active deck. The drop site marks this by turning **dashed**, so the two outcomes are told apart before the drop. When the panel is already **full** — the decks fill its height, so a new deck would not fit — or when the cap of **eight decks** is reached, a release clear of the decks starts nothing and the card is not docked.

# Page screenshot

A card shows a **screenshot** of its page rather than live HTML. The page is rendered offscreen with the same bounded Markdown renderer, the same content the preview builds (the page title, the frontmatter chips, then the rendered Markdown) and the tool's **own stylesheet**, drawn into an SVG `foreignObject`, and rasterised to a canvas. It fills a viewport of the **normal preview size** — `min(840px, 92vw)` by `min(82vh, 940px)` — anchored at the top-left, so it wraps and reads the same as when the preview opens it. That viewport is then anchored into the card's top-left, filling the card and cropping the overflow on the right. The page title is set about **three times** the body size. Images embedded in a page are not drawn, because an SVG loaded as an image does not fetch external resources. The bitmap is generated when the card is created, so a card always carries its page image.

# Sub-decks

When a multi-page guide is added as a **sub-deck**, the guide becomes one card whose pages appear as nested cards. The chevron expands and collapses the pages in place. A sub-deck is the way the deck holds a guide and its pages together, rather than as unrelated cards.

# Multiple decks

Up to **eight** decks can be kept at once. Every deck is shown as its own **stack** in the panel, separated by a gap, and every deck looks the same — none is dimmed. Every deck's cards **shuffle on hover**, and a dragged card lands in whichever deck's stack it is over. Every deck carries the same two chips — a **kind chip** on its top card and, when the deck has one, a **tag chip** under its bottom card. When the stacks are taller than the panel, the panel **scrolls** (no visible scrollbar). The **kind chip** is a plain label, not a control: a click on a card opens its page, making that deck active first, while a click on a deck's **stack** around the cards makes it active without opening a page; a new deck is started by dropping a card clear of every stack, or with the preview's **Add to deck ▾ → +**.

In the preview, **Add to deck ▾** opens a menu of the decks, plus a **+** button for a new one. Each deck is named by its **most prominent kind** and, when it has one, its most prominent **tag** — falling back to its ordinal name when it holds nothing recognisable — with its **card count**. The decks that already hold the page are **highlighted** and the rest **dimmed**. The menu stays open while you choose, so the page can be moved between decks in one go: clicking a highlighted deck **removes** the page from it, clicking a dimmed deck **adds** the page and makes that deck active, and the **+** button creates a deck and adds the page to it (disabled once eight decks exist). It closes only when the pointer is clicked outside it. A multi-page guide added to an empty deck opens into it as a sub-deck.

A deck holds no cards only when it is the last one left: removing a deck's last card removes the deck, and the add-to-deck menu never shows an empty deck. If the emptied deck was the active one, the next deck becomes active; when no deck is left, a single empty one stands ready for the next card.

# Reading from the deck

Opening a page from a deck card reads the whole deck as one **continuous stream**, fullscreen within the browser window: the decked pages follow each other in deck order, each as a section under a shared **top bar** that shows the page scrolled into view. The stream reads as a **centred column** (about 720px wide) with no visible scrollbar. The rest of the interface — the toolbar, legend and sidebar with its tab — is hidden, while the deck floats above and marks the page being read with the accent frame. No OS fullscreen is requested, and small screens read the same way as desktop.

The reading top bar keeps only the current page (title and path): the history controls, the add-to-deck button and the close button are not shown, and a small **grabber pill** sits at the top edge. Reading is left by **pulling the top handle — or the top bar — down**, which slides the reading view down to reveal the graph behind and closes once the pull passes a short distance; a shorter pull springs back. **Escape** also leaves reading. There is no click-outside close in reading, and the handle is clear of the text, so a pull is never taken for a text selection.

# Placement

The deck floats at the right edge with no panel of its own; the toolbar, spinner and filter sidebar are unaffected. Its empty space is dragged to **scroll** the docked decks, rather than reaching the graph behind it. Its drop site is a separate rectangle that marks where a dragged card lands for the whole drag, whether the deck is empty or already holds cards; on desktop it reaches **from near the top of the window down near its bottom**, so there is room to drop above the tab and clear of the decks to start a new one. On desktop it **docks to the left of the filter sidebar** when that panel is open, and to the **right edge** when the sidebar is hidden; either way the panel spans the column from near the top of the window down near its bottom, while its content starts a little **below the Filters tab** — with room for its title chip above the cards — so the decks can scroll all the way up to the top, and the tab stays visible as the sidebar's handle. On small screens it docks to the bottom-right, clear of the stacked toolbar, and its drop site grows upward from the deck's foot so it stays inside the window rather than running off the bottom. The preview overlay sits above the deck — except while reading from the deck, when the deck floats above the preview so its cards stay usable. Hovering is a pointer gesture, so the repel is unavailable on a touch screen.

# Connections

- [Interface design](interface-design.md)
- [Build a deck](../interface/deck.md)
- [Graph model](../model/graph-model.md)
- [Markdown preview](../algorithms/markdown-preview.md)

[^source]: The deck section of the tool source.
