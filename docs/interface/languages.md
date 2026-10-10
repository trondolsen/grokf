---
type: Reference
title: Languages
description: How the viewer's own interface is translated, and how it picks a language, writing direction and mirrored layout.
tags: [interface, i18n, language, rtl]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: source
    resource: ../../grokf.html
    title: grokf.html – the locale dictionaries and the language selector
  - id: w3c-lang
    resource: https://www.w3.org/TR/i18n-html-tech-lang/
    title: W3C – Declaring language in HTML
  - id: w3c-bidi
    resource: https://www.w3.org/TR/i18n-html-tech-bidi/
    title: W3C – Authoring HTML – Handling right-to-left scripts
  - id: m3-bidi
    resource: https://m3.material.io/foundations/layout/bidirectionality-rtl
    title: Material Design – Bidirectionality (RTL)
---

# What is translated

The viewer's own interface is translated: the toolbar, the filter sidebar, the About panel, the bundle dialog and the preview controls. A **Language** selector in the About panel switches language, and the choice is kept in the browser. The interface ships dictionaries for English, Spanish, French, German, Portuguese, Italian, Russian, Turkish, Hindi, Chinese (Simplified), Japanese, Korean and Arabic.

# Choosing a language

- `?lang=<tag>` on the URL wins, for example `?lang=de` or `?lang=zh-Hans`; a comma-separated list is tried in order.
- Otherwise the last choice saved in the browser is used.
- Otherwise the browser's own languages (`navigator.languages`) are matched, falling back to English.

Language tags follow BCP 47 and are canonicalised with `Intl.getCanonicalLocales`, so a request for `de-DE` or `pt-BR` resolves to the matching base language. A tag with no matching dictionary falls back to English, and the page then declares English.[^source]

# Declaring language

The root `<html>` element carries `lang="en"` in the markup, and the script updates it to the resolved interface language, so assistive technology announces the interface in the right language and with the right direction.[^w3c-lang]

The preview also declares the language of **what it shows**, rather than leaving the content to inherit the interface language:

- a concept's own `lang` (or `language`) frontmatter field, when a bundle provides one;
- English for the generated `Runtime internals` pages.

Content whose language is unknown inherits the interface language.

# Writing direction

The base direction follows the language. It is read from `Intl.Locale(lang).textInfo.direction`, which follows the **script**, so e.g. `az-Arab` is right-to-left while `az-Latn` is not; a base-language list is the fallback for engines without `Intl.Locale.textInfo`. Right-to-left languages set `dir="rtl"` on the page and the rest set `dir="ltr"`, and the preview's content region gets a `dir` to match the content language it declares.

# Bidirectional text

Left-to-right values shown inside the right-to-left interface are kept readable:[^w3c-bidi]

- file and directory **paths** (`#graphPath`, `#pvPath`) are marked `dir="ltr"` and `unicode-bidi: isolate`, so an `/` or `.` in a path cannot reorder the surrounding text;
- the preview's inline **code** and fenced code blocks are `direction: ltr` and isolated;
- the preview **title** uses `dir="auto"`, so an unknown-direction title takes its base direction from its first strong character;
- graph node **labels** are drawn with the context's direction set per label from the label's own first strong character (canvas has no `dir="auto"`), so a path-like label is not reordered;
- values substituted into interface messages (a bundle name, a URL) are wrapped in `<bdi dir="auto">`, and the message box is `dir="auto"`, so an opposite-direction value cannot reorder the sentence around it;
- direction-sensitive layout uses **logical properties** (`inset-inline`, `margin-inline`, `padding-inline`, `text-align: start`, `float: inline-end`), so the sidebar, toolbar, docked deck, popovers, preview header and lists mirror with the direction.

# Mirroring the layout

A right-to-left base direction mirrors the interface, following Material's bidirectionality guidance:[^m3-bidi]

- the docked **panels** move to the opposite edge — the filter sidebar docks to the inline-end edge and the legend to the inline-start edge — and their slide direction flips with them;
- the **toolbar** and its inset, the loading **spinner**, the docked **deck** of cards and its drop site, and the deck's edge cues all follow the same edge;
- directional **glyphs** — the toolbar and preview **back and forward chevrons** and the deck cards' **disclosure triangle** — are flipped horizontally, so “back” points the way the reader's script runs.

Content with an intrinsic direction is left unmirrored: the graph **canvas** and its node thumbnails, page screenshots and the brand **wordmark** stay as drawn. Paths, code and fenced code blocks stay marked left-to-right (see above).

# Plurals and names

Counted text, such as the "files · links" summary, uses `Intl.PluralRules` together with the language's CLDR plural categories, and the file and link nouns come from the dictionary. Language names in the selector come from `Intl.DisplayNames`. A translation that is missing falls back to the English default, so a control is never left blank.

# Scope and limits

Only the viewer's own interface is translated. Labels drawn from the bundle (concept types, tags, statuses and the legend's kind names), the deck menu and the attachment notes are shown as the bundle or the source provides them and stay in English.

# Connections

- [URL parameters](url-parameters.md)
- [Interface](index.md)

[^source]: The `I18N` dictionaries and the language selector in the tool source.
[^w3c-lang]: W3C, *Declaring language in HTML*.
[^w3c-bidi]: W3C, *Authoring HTML – Handling right-to-left scripts*.
[^m3-bidi]: Material Design, *Bidirectionality (RTL)*.
