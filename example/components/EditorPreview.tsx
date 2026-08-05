"use client";

import { RichTextEditor } from "@hellokit/react-rich-editor";
import "@hellokit/react-rich-editor/index.css";
import { useState } from "react";

export default function EditorPreview() {
  const [content, setContent] = useState(
    "<h1><strong>Introduction</strong></h1><p>If you're starting your web development journey, you've probably asked yourself:</p><blockquote><pre><code>Should I learn React.js or Next.js?</code></pre></blockquote><p>It's one of the most common questions among beginners.Many developers think React and Next.js are competitors. They are not. React is a JavaScript library. Next.js is a framework built on top of React.</p><p>That means whenever you build a Next.js application, you're still using React—but with many extra features that make development faster, easier, and more powerful. In this article, we'll compare React.js and Next.js in simple language so you can understand which one is the better choice for modern web development.</p>",
  );

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Write something amazing..."
    />
  );
}
