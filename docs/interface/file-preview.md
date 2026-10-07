---
type: Reference
title: File and image preview
description: How the preview panel shows non-Markdown files, including image files and the text toggle for text-based images.
tags: [interface, preview, images, files]
okfx:
  mode: reference
  version: praxis/1
sources:
  - id: source
    resource: ../../grokf.html
    title: grokf.html – renderPreviewEntry, renderImagePreview
---

# Preview content by kind

Clicking a node opens the preview panel. What it shows depends on the node kind:[^source]

- A **concept** or **index** node renders its Markdown; see [Markdown preview](../algorithms/markdown-preview.md).
- A **file** node (non-Markdown text) shows its source text. When the file is an image — in practice an SVG — the preview shows the image instead, with a **Show source** toggle (and **Show image** to switch back).
- An **attachment** node shows its file details. An image attachment is displayed inline, and a PDF shows its metadata.

The panel is one reused element: opening an entry replaces its content and scrolls it back to the top, so a new entry never opens where the previous one was left.[^source]

# Images

An image is shown only after the same URL checks as other images: the bytes are read within the bundle budget and displayed from a blob URL, never from a network or `data:` URL in the content. It is stretched to fill the preview area — scaled up or down as needed — while keeping its aspect ratio and showing the whole image, so it neither crops nor scrolls. A text-based image (kind `file`, such as an SVG) can switch between the rendered image and the source text, because its bytes are text. A binary image attachment has no text representation and so has no toggle.[^source]

# Failure and limits

If an image cannot be loaded, the preview shows a short notice instead. The per-image and per-preview limits apply, as for images embedded in Markdown. See [Limits and budgets](../security/limits-and-budgets.md).

# Connections

- [Graph model](../model/graph-model.md)
- [Local folders](local-folders.md)
- [Markdown preview](../algorithms/markdown-preview.md)
- [Limits and budgets](../security/limits-and-budgets.md)

[^source]: `renderPreviewEntry` and `renderImagePreview` in the tool source.
