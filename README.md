# @hellokit/react-rich-editor

A full-featured, Tiptap-based rich text editor for React — the same editor used across [moksedul.com](https://moksedul.com), packaged as a standalone, installable component.

- Rich formatting toolbar: headings, font size, text/highlight color, bold/italic/underline/strike/code, alignment, lists with indent, task list, blockquote, code block, horizontal rule
- Slash command menu (`/`) for quick-inserting blocks, filterable as you type
- Resizable, alignable images (drag handles, block/inline display, alt/title)
- Resizable, alignable YouTube embeds
- Tables with a bubble menu (add/remove rows & columns, cell background color, merge/split)
- Find & Replace (`Ctrl+F`), Keyboard Shortcuts reference, HTML source mode
- Pluggable image upload and AI content generation
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
| `onImageUpload`    | `(file: File) => Promise<string>`             | —                    | Upload a picked/dropped image and resolve its public URL. Without it, images are embedded as base64 data URLs. |
| `onAiGenerate`     | `(prompt: string) => Promise<string>`         | —                    | Handle an AI content generation request (return raw HTML). Without it, the AI Generator button is hidden. |

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

Type `/` at the start of an empty line to open a quick-insert menu (Text, Heading 1–3, Bullet/Numbered/Task List, Blockquote, Code Block, Table, Horizontal Rule, and Image when `onImageUpload` is configured). Filter by typing after `/`, navigate with arrow keys, select with Enter, dismiss with Escape.

### Other exports

```ts
import {
  getEditorExtensions, // the Tiptap extension list, if you want to build a custom editor instance
  SlashCommand, // the slash-command Tiptap extension, if building a custom extension list
  htmlToMarkdown,
  markdownToHtml,
} from "@hellokit/react-rich-editor";
```

## Next.js

All components are marked `"use client"`. Import and render `RichTextEditor` from a Client Component.

## License

MIT © Moksedul Islam
