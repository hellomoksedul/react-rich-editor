# @hellokit/react-rich-editor

![React Rich Editor Screenshot](https://edge.moksedul.com/images/1785917017782-edited-image.webp)

A full-featured, Tiptap-based rich text editor for React — the same editor used across [moksedul.com](https://moksedul.com), packaged as a standalone, installable component.

- Rich formatting toolbar: headings, font size, font weight (including a normal-weight override for headings), text/highlight color, bold/italic/underline/strike/code/subscript/superscript, alignment, lists with indent, task list, blockquote, code block, horizontal rule
- Automatic "smart" typography (straight quotes → curly quotes, `--` → em dash, `...` → ellipsis, etc.)
- Slash command menu (`/`) for quick-inserting blocks, filterable as you type, grouped into Editorial / Blocks / Patterns categories (same grouping as the toolbar's Insert menu)
- Resizable, alignable images (drag handles, block/inline display, alt/title)
- Resizable, alignable YouTube embeds
- Tables with a bubble menu (add/remove rows & columns, cell background color, merge/split)
- Advanced blocks: **Button** (CTA with its own contextual toolbar — filled/outline, alignment, corner radius, color, link, duplicate/delete), **Equation** (LaTeX, rendered with KaTeX, with a symbol palette), **Chart** (bar/horizontal-bar/grouped-bar/line/pie/donut, with a full data-point editor), **Columns** (2–3 column layouts with a layout switcher), **File Upload** (downloadable attachments), **Signature** (draw-and-insert, via a canvas pad)
- **FAQ** pattern — a canned Q&A outline insertion (under the Insert menu's Patterns category)
- Table of Contents popover — jump to any heading, tracks which section you're currently in
- Find & Replace (`Ctrl+F`), Insert Link (`Ctrl+K`), Horizontal Rule (`Ctrl+Shift+H`), Keyboard Shortcuts reference, HTML source mode
- Pluggable image upload, file upload, and AI content generation
- Word / character count and reading time

## Installation

```bash
npm install @hellokit/react-rich-editor
```

Peer dependencies: `react` and `react-dom` (>=18).

### Tailwind CSS setup (required)

The editor's UI is built with Tailwind utility classes and shadcn/ui-style design tokens. Your app must have Tailwind CSS configured.

**1. Import the editor's stylesheet** (ProseMirror content styles — headings, lists, tables, code blocks, etc.):

```ts
import "@hellokit/react-rich-editor/styles.css";
```

**2. Make sure Tailwind scans the package's compiled output**, so the utility classes used by the toolbar/dialogs are generated.

Tailwind v4 (CSS-first config):

```css
@import "tailwindcss";
@source "../node_modules/@hellokit/react-rich-editor/dist/**/*.{js,mjs}";
```

Tailwind v3 (`tailwind.config.js`):

```js
module.exports = {
  content: [
    // ...your existing content globs
    "./node_modules/@hellokit/react-rich-editor/dist/**/*.{js,mjs}",
  ],
};
```

**3. Define the shadcn-style theme tokens** the components rely on (`background`, `foreground`, `border`, `input`, `ring`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `popover`, plus their `-foreground` pairs), for **both** light and dark. Every component uses explicit token classes (`border-border`, `bg-popover`, ...) rather than relying on a global reset, and the editor's content CSS (`styles.css`) reads the same raw `--border`/`--foreground`/... variables directly — so as soon as your app defines them for light and dark, the whole editor (toolbar, dialogs, and typed content) follows automatically.

If your app already uses shadcn/ui with `next-themes` (class-based dark mode, e.g. `<html class="dark">`), you already have all of this — skip to Usage.

Otherwise, add it — Tailwind v4:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
}

:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --border: #e5e7eb;
  --input: #e5e7eb;
  --ring: #0a0a0a;
  --primary: #171717;
  --primary-foreground: #fafafa;
  --secondary: #f4f4f5;
  --secondary-foreground: #171717;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #f4f4f5;
  --accent-foreground: #171717;
  --destructive: #ef4444;
  --popover: #ffffff;
  --popover-foreground: #0a0a0a;
}

/* Toggle by adding/removing `dark` on <html> (this is what next-themes does) */
.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --border: #27272a;
  --input: #27272a;
  --ring: #d4d4d8;
  --primary: #fafafa;
  --primary-foreground: #171717;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #27272a;
  --accent-foreground: #fafafa;
  --destructive: #f87171;
  --popover: #18181b;
  --popover-foreground: #fafafa;
}
```

Tailwind v3 (`tailwind.config.js` + globals.css): define the same `--background`/`--border`/... variables in `:root` and `.dark` in your CSS, then map them in `theme.extend.colors` (`background: "hsl(var(--background))"` or plain `var(--background)`, matching whichever color format you used) — this is the same pattern the shadcn CLI generates.

Optional: install [`tailwindcss-animate`](https://github.com/jamiebuilds/tailwindcss-animate) (v3) or [`tw-animate-css`](https://github.com/Wombosvideo/tw-animate-css) (v4) for the dialog/popover fade & zoom animations. Everything works without it, just without the transition.

### Equation block setup (required for KaTeX styling)

The Equation block renders LaTeX with [KaTeX](https://katex.org/). Import KaTeX's stylesheet once in your app (it ships as a dependency of this package, so no extra install is needed):

```ts
import "katex/dist/katex.min.css";
```

Without it, equations still render but without KaTeX's font/spacing rules, so the math will look unstyled. Note that saved/exported HTML (`editor.getHTML()`) stores the raw LaTeX source rather than pre-rendered markup — re-rendering it elsewhere (outside this editor) requires running it through KaTeX again yourself.

## Usage

```tsx
import { useState } from "react";
import { RichTextEditor } from "@hellokit/react-rich-editor";
import "@hellokit/react-rich-editor/styles.css";

export default function Editor() {
  const [html, setHtml] = useState("<p>Hello world</p>");

  return (
    <RichTextEditor
      value={html}
      onChange={setHtml}
      placeholder="Start writing..."
    />
  );
}
```

### Props

| Prop              | Type                                          | Default            | Description                                                                 |
| ------------------ | --------------------------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| `value`            | `string`                                      | `""`                | HTML content (controlled).                                                    |
| `onChange`         | `(html: string) => void`                      | —                    | Called on every content update with the current HTML.                         |
| `placeholder`      | `string`                                      | `"Start writing..."`| Placeholder text shown on an empty document.                                  |
| `className`        | `string`                                      | —                    | Overrides the outer wrapper's className.                                      |
| `isSimple`         | `boolean`                                     | `false`              | Compact mode: hides word count, insert/media tools, shortcuts & AI generator. |
| `toolbarPosition`  | `"top" \| "bottom"`                           | `"top"`              | Where the toolbar renders.                                                    |
| `onImageUpload`    | `(file: File) => Promise<string>`             | —                    | Upload a picked/dropped/pasted image and resolve its public URL. Used by the toolbar/slash "Image" action, the Upload dialog, and dragging or pasting an image directly onto the editor. Without it, images are embedded as base64 data URLs. |
| `onListMedia`      | `() => Promise<MediaItem[]>`                  | —                    | Fetch previously uploaded media for the image dialog's Library tab. Without it, the Library tab is hidden. `MediaItem` is `{ url, name?, type?: "image" \| "video" }`. |
| `onAiGenerate`     | `(prompt: string) => Promise<string>`         | —                    | Handle an AI content generation request (return raw HTML). Without it, the AI Generator button is hidden. |
| `onFileUpload`     | `(file: File) => Promise<string>`             | —                    | Upload a picked/dropped file (any type) for the "Upload File" block and resolve its public URL. Without it, files are embedded as base64 data URLs — fine for small files, but a real backend is recommended for anything larger. |

### Inserting images

There are four ways to insert an image, all resolved through the same `onImageUpload`:

- Toolbar's Image button or `/image` slash command → opens the Add Image dialog (Upload / Library / URL tabs)
- **Drag and drop** an image file directly onto the editor content
- **Paste** an image (e.g. from the clipboard/screenshot) directly into the editor content

### Wiring up image upload

```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  onImageUpload={async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const { url } = await res.json();
    return url;
  }}
/>
```

If your backend uses a presigned-URL flow (e.g. Cloudflare R2 / S3, matching the pattern in `/api/r2/upload`):

```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  onImageUpload={async (file) => {
    const presignRes = await fetch("/api/r2/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }),
    });
    if (!presignRes.ok) throw new Error("Failed to get upload URL");
    const { url, key } = await presignRes.json();

    const uploadRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Upload failed");

    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    return publicUrl ? `${publicUrl}/${key}` : `/${key}`;
  }}
/>
```

### Wiring up a media library

```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  onImageUpload={uploadToR2}
  onListMedia={async () => {
    const res = await fetch("/api/r2/files?type=image&limit=50");
    const { files } = await res.json();
    return files.map((f: any) => ({ url: f.publicUrl, name: f.filename, type: "image" }));
  }}
/>
```

### Wiring up AI generation

```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  onAiGenerate={async (prompt) => {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    // Must resolve to raw HTML (h1, h2, p, ul, ol, strong, em, ...)
    return data.html;
  }}
/>
```

### Slash command menu

Type `/` at the start of an empty line to open a quick-insert menu, grouped into **Editorial** (Text, Headings, Lists, Task List, Blockquote, Code Block, Equation), **Blocks** (Table, Horizontal Rule, Image, YouTube, Button, Chart, 2/3 Columns, Upload File, Signature — the last two only when their respective `onFileUpload`/signature callbacks are wired up), and **Patterns** (FAQ). Filter by typing after `/` (search cuts across categories), navigate with arrow keys, select with Enter, dismiss with Escape. The toolbar's Insert (+) dropdown mirrors the same categories.

### Advanced blocks

- **Button** — a CTA with real editable text content. Select it to get a contextual toolbar: Filled/Outline, alignment, corner radius, color, link (URL), duplicate, delete.
- **Equation** — click to open a LaTeX editor with a symbol palette and live KaTeX preview. See "Equation block setup" above for the required CSS import.
- **Chart** — bar / horizontal bar / grouped bar / line / pie / donut, via [Recharts](https://recharts.org/). Hover to reveal an "Edit Chart" overlay with a full data-point editor (label/value/color rows, add/remove, chart type, title).
- **Columns** — a 2 or 3 column layout (`ColumnGroup` + `Column` nodes). Each column accepts normal block content — use `/` or the toolbar's Insert menu with the cursor inside a column, same as anywhere else. Select anywhere inside to get a layout switcher (only showing variants matching the current column count) and a delete-group button. Column count/drag-resize isn't supported in v1 — switch layout via the icon/label picker instead.
- **File Upload** — inserts a downloadable attachment (any file type), resolved through `onFileUpload` (or embedded as base64 without it).
- **Signature** — a draw-your-signature canvas pad (via [signature_pad](https://github.com/szimek/signature_pad)); on save, it's inserted as a regular (resizable) image.
- **FAQ** (Patterns category) — inserts a canned, fully-editable Q&A outline (heading + paragraph pairs) rather than a new node type — no locked-in structure to fight if you want to restyle or restructure it.

### Other exports

```ts
import {
  getEditorExtensions, // the Tiptap extension list, if you want to build a custom editor instance
  SlashCommand, // the slash-command Tiptap extension, if building a custom extension list
  htmlToMarkdown,
  markdownToHtml,
  ButtonBlock,
  ButtonBlockMenu,
  Equation,
  EquationEditDialog,
  ChartBlock,
  EditChartDialog,
  ColumnGroup,
  Column,
  ColumnsMenu,
  FileAttachment,
  FileUploadDialog,
  SignatureDialog,
} from "@hellokit/react-rich-editor";
import type {
  MediaItem,
  TocItem,
  FileAttachmentMeta,
  ChartType,
  ChartDataPoint,
  ColumnsLayout,
} from "@hellokit/react-rich-editor";
```

`getEditorExtensions(placeholder, options)` also accepts an `onTocUpdate?: (items: TocItem[]) => void` option if you're building a custom editor/toolbar and want to power your own Table of Contents UI — this is exactly how the built-in Toolbar's table-of-contents popover is implemented. `options.onFileCommand?: () => void` and `options.onSignatureCommand?: () => void` work the same way for a custom Upload File / Signature UI.

## Next.js (App Router) & Tailwind v4 Integration Guide

If you are using this package inside a modern Next.js 15 app with Turbopack and Tailwind CSS v4, you must follow these specific steps to ensure styles don't conflict and advanced React blocks (Charts, Layouts) render correctly on the frontend.

### 1. Next.js Config
Add the package to `transpilePackages` in your `next.config.ts` so Turbopack compiles the TypeScript source correctly:
```ts
const nextConfig = {
  transpilePackages: ["@hellokit/react-rich-editor"],
};
```

### 2. Tailwind CSS v4 Setup
To style the editor perfectly without letting the package's base variables leak into your project, **do not** import the root `index.css`. Instead, import only the scoped `editor-styles.css` and tell Tailwind to scan the package for utility classes.

Update your `app/globals.css`:
```css
@import "tailwindcss";
@import "@hellokit/react-rich-editor/src/editor-styles.css"; /* Scoped ProseMirror rules */
@source "@hellokit/react-rich-editor"; /* Compile tailwind classes used inside the package */
```

### 3. Rendering Content on the Frontend (The Most Important Step)
Tiptap's standard `dangerouslySetInnerHTML` will **fail** to render interactive blocks like Recharts (Charts) and Grid Layouts, because those are React components that disappear when converted to a raw HTML string.

You **must** use the `<RichTextViewer>` component to render the saved content on the frontend.

**Step A:** Create a dynamic wrapper in your project (e.g. `components/common/RichTextRenderer.tsx`):
```tsx
"use client";
import dynamic from "next/dynamic";
import { sanitizeRichText } from "@/lib/sanitize-html";

// ssr: false is required because Tiptap uses the window object
const RichTextViewer = dynamic(
  () => import("@hellokit/react-rich-editor").then((mod) => mod.RichTextViewer),
  { ssr: false, loading: () => <div>Loading...</div> }
);

export default function RichTextRenderer({ content, className }: { content: string, className?: string }) {
  // Always sanitize HTML before rendering
  const clean = sanitizeRichText(content || "");
  return <RichTextViewer content={clean} className={className} />;
}
```

**Step B:** If you use a sanitizer (like `sanitize-html`), ensure it allows `class`, `style`, and `data-*` attributes, otherwise Tiptap's layout structures will be stripped out:
```ts
allowedAttributes: {
  "*": ["class", "style", "data-*"],
}
```

**Step C:** Replace raw HTML injection in your frontend pages:
```tsx
// ❌ DO NOT DO THIS:
<div dangerouslySetInnerHTML={{ __html: blog.content }} />

// ✅ DO THIS INSTEAD:
<RichTextRenderer 
  content={blog.content} 
  className="ProseMirror prose prose-zinc max-w-none" 
/>
```

### 4. Image Generation (CORS Proxy)
If you are passing an `onGenerateImage` handler to `<RichTextEditor>` that uses an external AI service (like Pollinations), do not fetch it directly from the client browser. Browsers will block the request (CORS) or return a corrupted error blob. 
Always route the image generation through a Next.js API route (`/api/generate-image/route.ts`) to download the image securely on the server and pass the ArrayBuffer back to the client.

## License

MIT © Moksedul Islam
