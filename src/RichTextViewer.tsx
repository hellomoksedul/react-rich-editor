"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getEditorExtensions } from "./extensions";

export interface RichTextViewerProps {
  content: string;
  className?: string;
}

export function RichTextViewer({ content, className = "" }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: content,
    editable: false,
    immediatelyRender: true,
  });

  if (!editor) return null;

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
