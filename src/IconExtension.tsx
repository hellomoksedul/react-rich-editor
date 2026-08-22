"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { useEffect, useState } from "react";
import { fetchIconSvg } from "./lib/icon-api";
import { cn } from "./lib/utils";

export interface IconNodeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iconNode: {
      insertIcon: (options: {
        name: string;
        size?: number;
        color?: string;
        strokeWidth?: number;
        svg?: string;
      }) => ReturnType;
    };
  }
}

function sanitizeVectorSvg(svg: string): string {
  if (!svg) return "";
  return svg
    .replace(/width="[^"]*"/, 'width="100%"')
    .replace(/height="[^"]*"/, 'height="100%"');
}

function IconNodeView({
  node,
  selected,
  editor,
  getPos,
  updateAttributes,
}: NodeViewProps) {
  const { name, size: initialSize, color, strokeWidth, svg: initialSvg } = node.attrs as {
    name: string;
    size: number;
    color: string;
    strokeWidth: number;
    svg?: string;
  };

  const currentSize = initialSize || 24;
  const [svgCode, setSvgCode] = useState<string>(
    initialSvg ? sanitizeVectorSvg(initialSvg) : "",
  );

  useEffect(() => {
    let isMounted = true;
    if (!initialSvg && name) {
      fetchIconSvg(name).then((res) => {
        if (isMounted && res) {
          const sanitized = sanitizeVectorSvg(res);
          setSvgCode(sanitized);
          updateAttributes({ svg: sanitized });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [name, initialSvg, updateAttributes]);


  return (
    <NodeViewWrapper
      as="span"
      className="inline-flex items-center align-middle mx-0.5 select-none relative group"
    >
      <span
        onClick={(e) => {
          if (editor.isEditable && typeof getPos === "function") {
            e.stopPropagation();
            const pos = getPos();
            if (typeof pos === "number") {
              editor.commands.setNodeSelection(pos);
            }
          }
        }}
        style={{
          width: `${currentSize}px`,
          height: `${currentSize}px`,
        }}
        className={cn(
          "relative inline-flex items-center justify-center rounded transition-all cursor-pointer",
          editor.isEditable &&
            selected &&
            "ring-2 ring-primary ring-offset-2 rounded-md",
          editor.isEditable && !selected && "hover:bg-accent/40 rounded",
        )}
        title={`Icon: ${name} (${currentSize}px)`}
      >
        {svgCode ? (
          <span
            style={{
              width: `${currentSize}px`,
              height: `${currentSize}px`,
              color: color || "currentColor",
            }}
            className="inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:currentColor [&>svg]:block pointer-events-none"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        ) : (
          <span
            style={{
              width: `${currentSize}px`,
              height: `${currentSize}px`,
            }}
            className="inline-block bg-muted/40 animate-pulse rounded"
          />
        )}
      </span>
    </NodeViewWrapper>
  );
}

export const IconExtension = Node.create<IconNodeOptions>({
  name: "iconNode",
  group: "inline",
  inline: true,
  selectable: true,
  draggable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      name: {
        default: "lucide:check",
        parseHTML: (element) =>
          element.getAttribute("data-name") || "lucide:check",
        renderHTML: (attributes) => ({ "data-name": attributes.name }),
      },
      size: {
        default: 24,
        parseHTML: (element) =>
          Number(element.getAttribute("data-size")) || 24,
        renderHTML: (attributes) => ({ "data-size": attributes.size }),
      },
      color: {
        default: "currentColor",
        parseHTML: (element) =>
          element.getAttribute("data-color") || "currentColor",
        renderHTML: (attributes) => ({ "data-color": attributes.color }),
      },
      strokeWidth: {
        default: 2,
        parseHTML: (element) =>
          Number(element.getAttribute("data-stroke-width")) || 2,
        renderHTML: (attributes) => ({
          "data-stroke-width": attributes.strokeWidth,
        }),
      },
      svg: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-svg") || "",
        renderHTML: (attributes) => ({ "data-svg": attributes.svg }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-icon-node]",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { name, size, color, strokeWidth, svg } = node.attrs;

    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-icon-node": "",
        "data-name": name,
        "data-size": size,
        "data-color": color,
        "data-stroke-width": strokeWidth,
        class:
          "hellokit-icon-wrapper inline-flex items-center align-middle mx-0.5",
        style: `width:${size || 24}px;height:${size || 24}px;color:${color || "currentColor"};display:inline-flex;vertical-align:middle;`,
      }),
      svg
        ? [
            "span",
            { class: "inline-flex w-full h-full [&>svg]:w-full [&>svg]:h-full" },
            svg,
          ]
        : 0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(IconNodeView);
  },

  addCommands() {
    return {
      insertIcon:
        (options) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                name: options.name,
                size: options.size || 24,
                color: options.color || "currentColor",
                strokeWidth: options.strokeWidth || 2,
                svg: options.svg || "",
              },
            })
            .run();
        },
    };
  },
});
