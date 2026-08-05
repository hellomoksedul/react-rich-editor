"use client";

import { RichTextEditor } from "@hellokit/react-rich-editor";
import "@hellokit/react-rich-editor/index.css";
import { useState } from "react";

export default function EditorPreview() {
  const [content, setContent] = useState(
    "<p>Welcome to <strong>HelloKit React Rich Editor</strong>! Start typing...</p>",
  );

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Write something amazing..."
    />
  );
}
