"use client";

import { RichTextEditor } from "@hellokit/react-rich-editor";
import { useState } from "react";

const DEFAULT_CONTENT = `<p style="line-height: 1.625;"><strong>@hellokit/icon-picker</strong> is a highly polished, production-ready React Icon Picker for React and Next.js applications, built for SaaS products, website builders, and form builders.</p><h2 id="0b8fc839-f771-4af0-8d6b-721b2d874219" data-toc-id="0b8fc839-f771-4af0-8d6b-721b2d874219" style="line-height: 1.25;"><strong>Why Use This React Icon Picker</strong></h2><ul><li><p style="line-height: 1.625;"><strong>100,000+ Icons Supported:</strong> Seamlessly supports the entire <code>react-icons</code> library ecosystem.</p></li><li><p style="line-height: 1.625;"><strong>Zero UI Lag:</strong> Highly optimized lazy-loading and chunk-based rendering keep the picker fast even at scale.</p></li><li><p style="line-height: 1.625;"><strong>Fully Themed:</strong> Native light/dark mode support via CSS variables, with easy global or per-instance overrides.</p></li><li><p style="line-height: 1.625;"><strong>SVG Output Mode:</strong> Automatically converts selected icons to raw SVG strings to avoid bundling bloat in consuming projects.</p></li><li><p style="line-height: 1.625;"><strong>Multiple Variants:</strong> Built-in <code>card</code>, <code>button</code>, <code>ghost</code>, and <code>dashed</code> field styles.</p></li><li><p style="line-height: 1.625;"><strong>Tailwind Compatible:</strong> Styles can be overridden directly with standard Tailwind CSS classes.</p></li></ul><h2 id="5c7147ce-901d-45a1-a6f3-26593fa5f831" data-toc-id="5c7147ce-901d-45a1-a6f3-26593fa5f831" style="line-height: 1.25;"><strong>Installation</strong></h2><pre><code class="language-bash">npm install @hellokit/icon-picker
# or
pnpm add @hellokit/icon-picker
# or
yarn add @hellokit/icon-picker</code></pre><h2 id="b6f5c5a7-9528-419b-9f5b-8521c051f7bc" data-toc-id="b6f5c5a7-9528-419b-9f5b-8521c051f7bc" style="line-height: 1.25;"><strong>Quick Start</strong></h2><h3 id="6f9c6b1b-05b0-4666-b091-2608e46eb4a3" data-toc-id="6f9c6b1b-05b0-4666-b091-2608e46eb4a3" style="line-height: 1.3;"><strong>1. Import CSS (globally)</strong></h3><pre><code class="language-tsx">// app/layout.tsx
import "@hellokit/icon-picker/dist/index.css";</code></pre><h3 id="e3647126-489a-45e2-80b2-c3964facbd88" data-toc-id="e3647126-489a-45e2-80b2-c3964facbd88" style="line-height: 1.3;"><strong>2. Wrap with Provider (optional but recommended)</strong></h3><pre><code class="language-tsx">import { IconProvider } from "@hellokit/icon-picker";

export default function App({ children }) {
  return (
    &lt;IconProvider config={{ outputFormat: "svg" }}&gt;{children}&lt;/IconProvider&gt;
  );
}</code></pre><h3 id="a398ea47-aaca-496c-bf55-e458ab21ff52" data-toc-id="a398ea47-aaca-496c-bf55-e458ab21ff52" style="line-height: 1.3;"><strong>3. Use the picker field</strong></h3><pre><code class="language-tsx">import { IconPickerField, type IconValue } from "@hellokit/icon-picker";
import { useState } from "react";

export default function MyComponent() {
  const [icon, setIcon] = useState&lt;IconValue | null&gt;(null);

  return (
    &lt;div className="p-10"&gt;
      &lt;IconPickerField
        value={icon}
        onChange={setIcon}
        variant="button"
        size="md"
        placeholder="Select an Icon"
      /&gt;
    &lt;/div&gt;
  );
}</code></pre><h2 id="5c2d124c-23aa-45d6-9ca9-5da513ae128d" data-toc-id="5c2d124c-23aa-45d6-9ca9-5da513ae128d" style="line-height: 1.25;"><strong>Customizing Styles</strong></h2><pre><code class="language-tsx">&lt;IconPickerField
  value={icon}
  onChange={setIcon}
  className="w-full hover:border-red-500 rounded-none shadow-xl"
  theme={{
    primary: "#eab308",
    bg: "#18181b",
    fg: "#ffffff",
  }}
/&gt;</code></pre><h3 id="aa456e3e-b5e9-49fc-8c53-b1f198651659" data-toc-id="aa456e3e-b5e9-49fc-8c53-b1f198651659" style="line-height: 1.3;"><strong>Global theme overrides</strong></h3><pre><code class="language-css">:root {
  --ip-primary: #3b82f6;
  --ip-primary-fg: #ffffff;
  --ip-bg: #ffffff;
  --ip-surface: #f4f4f5;
  --ip-border: #e4e4e7;
  --ip-fg: #09090b;
  --ip-fg-muted: #71717a;
}

.dark {
  --ip-bg: #09090b;
  --ip-surface: #18181b;
  --ip-border: #27272a;
  --ip-fg: #ffffff;
  --ip-fg-muted: #a1a1aa;
}</code></pre><p></p>`;

export default function EditorPreview() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  return (
    <section id="demo" className="px-4 max-w-6xl mx-auto w-full">
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Start writing your masterpiece..."
      />
    </section>
  );
}
