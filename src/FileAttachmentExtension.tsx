"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { FileText, Trash2 } from "lucide-react";
import { cn } from "./lib/utils";

export interface FileAttachmentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileAttachment: {
      /** Insert a downloadable file attachment block. */
      setFileAttachment: (attrs: { url: string; name: string; size?: number }) => ReturnType;
    };
  }
}

function formatSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileAttachmentView({ node, deleteNode, selected, editor }: NodeViewProps) {
  const { url, name, size } = node.attrs as { url: string; name: string; size: number };

  return (
    <NodeViewWrapper
      data-file-attachment-wrapper=""
      className={cn(
        "my-2 flex max-w-sm items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2",
        selected && "ring-2 ring-primary",
      )}
    >
      <FileText className="h-6 w-6 shrink-0 text-muted-foreground" />
      <a
        href={url}
        download={name || true}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
        contentEditable={false}
      >
        <div className="truncate text-sm font-medium text-foreground">{name || "Attachment"}</div>
        {!!size && <div className="text-xs text-muted-foreground">{formatSize(size)}</div>}
      </a>
      {editor.isEditable && (
        <button
          type="button"
          onClick={deleteNode}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
          contentEditable={false}
          title="Remove attachment"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </NodeViewWrapper>
  );
}

/** A downloadable file attachment (any file type — PDF, doc, zip, ...),
 * resolved through the same onFileUpload-or-base64 pattern images use. */
export const FileAttachment = Node.create<FileAttachmentOptions>({
  name: "fileAttachment",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute("href"),
        renderHTML: (attributes) => ({ href: attributes.url }),
      },
      name: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-name") || element.textContent || "",
        renderHTML: (attributes) => ({ "data-name": attributes.name }),
      },
      size: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute("data-size")) || 0,
        renderHTML: (attributes) => ({ "data-size": String(attributes.size || 0) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "a[data-file-attachment]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-file-attachment": "",
        download: node.attrs.name || "",
      }),
      node.attrs.name || "Attachment",
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView);
  },

  addCommands() {
    return {
      setFileAttachment:
        (attrs) =>
        ({ chain }) => {
          return chain().insertContent({ type: this.name, attrs }).run();
        },
    };
  },
});
