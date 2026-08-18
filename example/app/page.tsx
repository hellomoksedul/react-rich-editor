"use client";

import { RichTextEditor } from "@hellokit/react-rich-editor";
import "@hellokit/react-rich-editor/index.css";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState(`
    <h1>The Art of Modern Web Development</h1>
    <p>In the rapidly evolving landscape of frontend engineering, the intersection of <strong>beautiful design</strong> and <em>functional architecture</em> has never been more important. Today, we are pushing the boundaries of what is possible in the browser.</p>
    
    <h2 id="f6fdb747-625a-41d6-b7df-938e25a36585" data-toc-id="f6fdb747-625a-41d6-b7df-938e25a36585">How to connect html server</h2><p>Use this code for your editor <code>&lt;Accordion defaultValue={["item-1"]}&gt;</code></p><pre><code class="language-typescript">&lt;Accordion defaultValue={["item-1"]}&gt;
  &lt;AccordionItem value="item-1"&gt;
    &lt;AccordionTrigger&gt;Is it accessible?&lt;/AccordionTrigger&gt;
    &lt;AccordionContent&gt;
      Yes. It adheres to the WAI-ARIA design pattern.
    &lt;/AccordionContent&gt;
  &lt;/AccordionItem&gt;
&lt;/Accordion&gt;</code></pre><h2 id="052701c3-a320-471c-b010-943b0007771e" data-toc-id="052701c3-a320-471c-b010-943b0007771e">Here is my Cover Image</h2><p><img src="https://edge.moksedul.com/images/1787086446790-cover.webp" align="center" fullwidth="true" display="inline"></p>
    
    <h3>Key advantages of modern editor tools:</h3>
    <ul>
      <li><strong>Seamless Customization:</strong> Tailor every pixel without fighting the framework.</li>
      <li><strong>Rich Media Support:</strong> Effortlessly drop in high-res images and interactive embeds.</li>
      <li><strong>Dark Mode Excellence:</strong> Out-of-the-box support for beautiful dark themes.</li>
    </ul>

    <p>Take a look at the feature comparison below:</p>

    <table style="width: 100%">
      <tbody>
        <tr>
          <th colspan="1" rowspan="1"><p>Capability</p></th>
          <th colspan="1" rowspan="1"><p>Status</p></th>
          <th colspan="1" rowspan="1"><p>Description</p></th>
        </tr>
        <tr>
          <td colspan="1" rowspan="1"><p>Image Resizing</p></td>
          <td colspan="1" rowspan="1"><p>🚀 Advanced</p></td>
          <td colspan="1" rowspan="1"><p>Sleek pill handles with smooth ratio preservation.</p></td>
        </tr>
        <tr>
          <td colspan="1" rowspan="1"><p>UI Components</p></td>
          <td colspan="1" rowspan="1"><p>🎨 Shadcn</p></td>
          <td colspan="1" rowspan="1"><p>Beautifully animated popovers and dialogs.</p></td>
        </tr>
      </tbody>
    </table>
    
    <p>The journey of building a perfect rich text editor is ongoing, but with these tools, we are closer than ever.</p>
  `);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      <div className="w-full max-w-7xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            React Rich Editor
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            A powerful, Shadcn-based rich text editor for React.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-2 md:p-6">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write something amazing..."
          />
        </div>

        <div className="mt-8 bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 font-mono text-sm overflow-auto max-h-64 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xs font-semibold uppercase text-neutral-500 mb-2">
            HTML Output
          </h2>
          <pre className="whitespace-pre-wrap wrap-break-word">{content}</pre>
        </div>
      </div>
    </main>
  );
}
