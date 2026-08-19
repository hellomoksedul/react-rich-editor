"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getEditorExtensions } from "./extensions";
import { StyleInjector } from "./StyleInjector";

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
    <>
      <StyleInjector />
      <div className={className}>
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
