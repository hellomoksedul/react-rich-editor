# @hellokit/react-rich-editor

A full-featured, Tiptap-based rich text editor for React — the same editor used across [moksedul.com](https://moksedul.com), packaged as a standalone, installable component.

- Rich formatting toolbar: headings, font size, text/highlight color, bold/italic/underline/strike/code, alignment, lists with indent, blockquote, code block, horizontal rule
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

**3. Define the shadcn-style theme tokens** the components rely on (`background`, `foreground`, `border`, `input`, `ring`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `popover`, plus their `-foreground` pairs). If your app already uses shadcn/ui, you already have these. Otherwise add them to your theme, e.g. (Tailwind v4):

```css
@theme {
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  --color-border: #e5e7eb;
  --color-input: #e5e7eb;
  --color-ring: #0a0a0a;
  --color-primary: #171717;
  --color-primary-foreground: #fafafa;
  --color-secondary: #f4f4f5;
  --color-secondary-foreground: #171717;
  --color-muted: #f4f4f5;
  --color-muted-foreground: #71717a;
  --color-accent: #f4f4f5;
  --color-accent-foreground: #171717;
  --color-destructive: #ef4444;
  --color-popover: #ffffff;
  --color-popover-foreground: #0a0a0a;
}
```

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

### Other exports

```ts
import {
  getEditorExtensions, // the Tiptap extension list, if you want to build a custom editor instance
  htmlToMarkdown,
  markdownToHtml,
} from "@hellokit/react-rich-editor";
```

## Next.js

All components are marked `"use client"`. Import and render `RichTextEditor` from a Client Component.

## License

MIT © Moksedul Islam
