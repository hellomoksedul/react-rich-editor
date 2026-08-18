"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import { cn } from "./lib/utils";

export interface ButtonBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    buttonBlock: {
      /** Insert a new Button (CTA) block at the current selection. */
      setButtonBlock: () => ReturnType;
    };
  }
}

function radiusToClass(radius: string) {
  if (radius === "full") return "rounded-full";
  if (radius === "none") return "rounded-none";
  return "rounded-md";
}

function radiusToPx(radius: string) {
  if (radius === "full") return "9999px";
  if (radius === "none") return "0px";
  return "6px";
}

function ButtonBlockView({ node, selected, editor, updateAttributes }: NodeViewProps) {
  const { href, variant, align, radius, color } = node.attrs as {
    href: string;
    variant: "filled" | "outline";
    align: "left" | "center" | "right";
    radius: "none" | "sm" | "full";
    color: string;
  };
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [urlDraft, setUrlDraft] = useState(href);

  const alignClass =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  const openLinkEditor = () => {
    setUrlDraft(href);
    setIsEditingLink(true);
  };

  const saveLink = () => {
    updateAttributes({ href: urlDraft.trim() || "#" });
    setIsEditingLink(false);
  };

  return (
    <NodeViewWrapper data-button-block-wrapper="" className="group my-2">
      <div className={cn("flex items-center gap-2", alignClass)}>
        <NodeViewContent
          as="span"
          data-button-block=""
          className={cn(
            "inline-flex min-w-10 items-center px-4 py-2 text-sm font-medium border-2 outline-none transition-shadow",
            radiusToClass(radius),
            selected && "ring-2 ring-primary ring-offset-2",
          )}
          style={{
            color: variant === "outline" ? color : "#ffffff",
            backgroundColor: variant === "outline" ? "transparent" : color,
            borderColor: color,
          }}
        />
        {editor.isEditable && (
          <button
            type="button"
            onClick={openLinkEditor}
            contentEditable={false}
            title="Edit link"
            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isEditingLink && (
        <div
          contentEditable={false}
          className={cn("mt-2 flex max-w-md items-center gap-1.5 rounded-md border border-border bg-background p-1.5 shadow-sm", align === "center" && "mx-auto", align === "right" && "ml-auto")}
        >
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://..."
            autoFocus
            className="flex-1 rounded-sm border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter") saveLink();
              if (e.key === "Escape") setIsEditingLink(false);
            }}
          />
          <button
            type="button"
            onClick={saveLink}
            className="rounded-sm px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-accent"
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => setIsEditingLink(false)}
            className="rounded-sm p-1 text-muted-foreground hover:bg-accent"
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

/**
 * A CTA-style Button block. The label is real editable text content (so it
 * behaves like any other inline text — selectable, retains marks, etc.),
 * while href/variant/align/radius/color are node attributes edited via the
 * ButtonBlockMenu contextual toolbar (see ButtonBlockMenu.tsx).
 */
export const ButtonBlock = Node.create<ButtonBlockOptions>({
  name: "buttonBlock",
  group: "block",
  content: "text*",
  draggable: true,
  isolating: true,
  marks: "",

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      href: {
        default: "#",
        parseHTML: (element) => element.getAttribute("data-href") || element.getAttribute("href"),
        renderHTML: (attributes) => ({ "data-href": attributes.href }),
      },
      variant: {
        default: "filled",
        parseHTML: (element) => element.getAttribute("data-variant") || "filled",
        renderHTML: (attributes) => ({ "data-variant": attributes.variant }),
      },
      align: {
        default: "left",
        parseHTML: (element) => element.getAttribute("data-align") || "left",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
      radius: {
        default: "sm",
        parseHTML: (element) => element.getAttribute("data-radius") || "sm",
        renderHTML: (attributes) => ({ "data-radius": attributes.radius }),
      },
      color: {
        default: "#2563eb",
        parseHTML: (element) => element.getAttribute("data-color") || "#2563eb",
        renderHTML: (attributes) => ({ "data-color": attributes.color }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "a[data-button-block]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { variant, color, radius, href } = node.attrs;
    const style =
      variant === "outline"
        ? `display:inline-block;padding:8px 16px;font-weight:500;border:2px solid ${color};border-radius:${radiusToPx(radius)};color:${color};background:transparent;text-decoration:none;`
        : `display:inline-block;padding:8px 16px;font-weight:500;border:2px solid ${color};border-radius:${radiusToPx(radius)};color:#fff;background:${color};text-decoration:none;`;
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-button-block": "",
        href,
        style,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ButtonBlockView);
  },

  addCommands() {
    return {
      setButtonBlock:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              content: [{ type: "text", text: "Click me" }],
            })
            .run();
        },
    };
  },
});
