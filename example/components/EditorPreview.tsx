"use client";

import { RichTextEditor } from "@hellokit/react-rich-editor";
import { useState } from "react";

const DEFAULT_CONTENT = `<h1 id="68bc5a6a-0eb9-412e-bb47-d2a67ef9347b" data-toc-id="68bc5a6a-0eb9-412e-bb47-d2a67ef9347b">Hello, react-rich-editor!</h1><p>This editor supports <strong>multi-column</strong> responsive grid layouts natively. Try selecting this area and changing the layout from the floating menu.</p><p><img src="https://edge.moksedul.com/images/1787086446790-cover.webp" align="center" fullwidth="true" display="inline"></p><h3 id="44f3f811-dfe2-43ba-9d36-9eda4287a794" data-toc-id="44f3f811-dfe2-43ba-9d36-9eda4287a794">Powerful React Node Views</h3><p>You can insert fully interactive React components directly into the document, like this Recharts data visualization:</p><div data-chart-type="bar" data-title="Monthly Revenue" data-points="[{&quot;label&quot;:&quot;Jan&quot;,&quot;value&quot;:400,&quot;color&quot;:&quot;#b80a0a&quot;},{&quot;label&quot;:&quot;Feb&quot;,&quot;value&quot;:300,&quot;color&quot;:&quot;#008552&quot;},{&quot;label&quot;:&quot;Mar&quot;,&quot;value&quot;:550,&quot;color&quot;:&quot;#c77e00&quot;},{&quot;label&quot;:&quot;April&quot;,&quot;value&quot;:680,&quot;color&quot;:&quot;#ea580c&quot;},{&quot;label&quot;:&quot;May&quot;,&quot;value&quot;:1500,&quot;color&quot;:&quot;#7c3aed&quot;},{&quot;label&quot;:&quot;June&quot;,&quot;value&quot;:2500,&quot;color&quot;:&quot;#0891b2&quot;},{&quot;label&quot;:&quot;July&quot;,&quot;value&quot;:3000,&quot;color&quot;:&quot;#2563eb&quot;}]" data-chart-block=""></div><h3 id="a1a695cb-6be2-4433-8799-684627df9078" data-toc-id="a1a695cb-6be2-4433-8799-684627df9078">Slash Commands &amp; AI</h3><p>Type <code>/</code> on an empty line to open the slash menu. You can insert tables, blockquotes, signatures, or even ask AI to write content for you.</p><blockquote><p>The best rich text editor is the one that feels invisible until you need its power.</p></blockquote><table data-full-width="true" style="min-width: 323px;"><colgroup><col style="min-width: 25px;"><col style="width: 298px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Feature</p></th><th colspan="1" rowspan="1" colwidth="298"><p>Support</p></th></tr><tr><td colspan="1" rowspan="1"><p>Tailwind CSS</p></td><td colspan="1" rowspan="1" colwidth="298"><p>Native?</p></td></tr><tr><td colspan="1" rowspan="1"><p>Next.js App Router</p></td><td colspan="1" rowspan="1" colwidth="298"><p>100% Compatible??</p></td></tr></tbody></table><p></p>`;

export default function EditorPreview() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  return (
    <section id="demo" className="px-6 max-w-6xl mx-auto w-full">
      <div className="bg-background rounded-xl border border-foreground/10 shadow-2xl overflow-hidden min-h-150 p-6">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Start writing your masterpiece..."
          className="rounded-lg"
        />
      </div>
    </section>
  );
}
