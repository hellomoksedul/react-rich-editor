"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { Plus } from "lucide-react";
import React from "react";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface LayoutGroupOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    layoutGroup: {
      /** Insert a new Layout block */
      setLayout: (options?: {
        display?: "flex" | "grid";
        cols?: number;
      }) => ReturnType;
    };
  }
}

function LayoutGroupView({
  node,
  editor,
  getPos,
  updateAttributes,
}: NodeViewProps) {
  const { gridCols, gridTemplate } = node.attrs;
  const templateStr =
    gridTemplate || `repeat(${gridCols || 2}, minmax(0, 1fr))`;

  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    const updateFocus = () => {
      const pos = typeof getPos === "function" ? getPos() : undefined;
      if (typeof pos !== "number") return;
      const { from, to } = editor.state.selection;
      const focused = from >= pos && to <= pos + node.nodeSize;
      setIsFocused(focused);
    };

    editor.on("selectionUpdate", updateFocus);
    updateFocus(); // Initial check

    return () => {
      editor.off("selectionUpdate", updateFocus);
    };
  }, [editor, getPos, node.nodeSize]);

  return (
    <NodeViewWrapper
      data-layout-group-wrapper=""
      className={`my-4 border border-dashed p-1.5 rounded-xl relative transition-colors ${
        isFocused
          ? "border-[#b57d37]/60"
          : "border-transparent hover:border-[#b57d37]/30"
      }`}
    >
      <NodeViewContent
        as="div"
        className="hellokit-layout-content grid w-full gap-4"
        style={
          {
            "--layout-template": templateStr,
          } as React.CSSProperties
        }
      />
    </NodeViewWrapper>
  );
}

function LayoutItemView({
  node,
  editor,
  getPos,
  updateAttributes,
}: NodeViewProps) {
  const pos = typeof getPos === "function" ? getPos() : undefined;
  let index = 0;
  if (typeof pos === "number") {
    const resolved = editor.state.doc.resolve(pos);
    index = resolved.index(resolved.depth);
  }

  const { colSpan, flexGrow } = node.attrs;

  const updateItem = (attrs: Record<string, any>) => {
    updateAttributes(attrs);
  };

  const TooltipBtn = ({
    onClick,
    icon: Icon,
    title,
    active = false,
    text,
  }: any) => (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-6 p-1", !text && "w-6", active && "bg-accent")}
          onClick={onClick}
          aria-label={title}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {text && (
            <span className="text-[10px] font-medium ml-0.5">{text}</span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="px-2 py-1.5 text-xs">
        {title}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <NodeViewWrapper
      data-layout-item-wrapper=""
      className={cn(
        "hellokit-layout-item relative rounded-xl border border-transparent bg-black p-3 shadow-sm min-w-0 flex flex-col h-full w-full transition-colors hover:border-white/10",
      )}
      style={
        {
          gridColumn: colSpan ? `span ${colSpan} / span ${colSpan}` : undefined,
          flexGrow: flexGrow,
        } as React.CSSProperties
      }
    >
      {editor.isEditable && (
        <div
          className="mb-3 flex items-center justify-between"
          contentEditable={false}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#e6c196] select-none">
            COL {index + 1}
          </span>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full bg-[#fde9d2] px-2.5 py-0.5 text-[10px] font-semibold text-[#b57d37] transition-colors hover:bg-[#fbdcb5]"
            onClick={() => {
              if (typeof getPos === "function") {
                const pos = getPos();
                if (typeof pos === "number") {
                  editor
                    .chain()
                    .focus()
                    .insertContentAt(pos + node.nodeSize - 1, {
                      type: "paragraph",
                    })
                    .run();
                }
              }
            }}
          >
            <Plus className="h-3 w-3" />
            block
          </button>
        </div>
      )}
      <NodeViewContent className="flex-1" />
    </NodeViewWrapper>
  );
}

export const LayoutItem = Node.create({
  name: "layoutItem",
  content: "block+",
  isolating: true,

  addAttributes() {
    return {
      colSpan: {
        default: 1,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-colspan") || "1", 10),
        renderHTML: (attributes) => ({ "data-colspan": attributes.colSpan }),
      },
      flexGrow: {
        default: 1,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-flexgrow") || "1", 10),
        renderHTML: (attributes) => ({ "data-flexgrow": attributes.flexGrow }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-layout-item]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-layout-item": "",
        class: "hellokit-layout-item",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LayoutItemView);
  },
});

export const LayoutGroup = Node.create<LayoutGroupOptions>({
  name: "layoutGroup",
  group: "block",
  content: "layoutItem{1,6}",
  draggable: true,
  isolating: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      display: {
        default: "grid",
        parseHTML: (element) => element.getAttribute("data-display") || "grid",
        renderHTML: (attributes) => ({ "data-display": attributes.display }),
      },
      flexDir: {
        default: "row",
        parseHTML: (element) => element.getAttribute("data-flexdir") || "row",
        renderHTML: (attributes) => ({ "data-flexdir": attributes.flexDir }),
      },
      gridCols: {
        default: 2,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-gridcols") || "2", 10),
        renderHTML: (attributes) => ({ "data-gridcols": attributes.gridCols }),
      },
      gap: {
        default: 4,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-gap") || "4", 10),
        renderHTML: (attributes) => ({ "data-gap": attributes.gap }),
      },
      alignItems: {
        default: "start",
        parseHTML: (element) => element.getAttribute("data-align") || "start",
        renderHTML: (attributes) => ({ "data-align": attributes.alignItems }),
      },
      justifyContent: {
        default: "start",
        parseHTML: (element) => element.getAttribute("data-justify") || "start",
        renderHTML: (attributes) => ({
          "data-justify": attributes.justifyContent,
        }),
      },
      gridTemplate: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-layout-group]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-layout-group": "",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LayoutGroupView);
  },

  addCommands() {
    return {
      setLayout:
        (options = {}) =>
        ({ chain }) => {
          const count = options.cols || 2;
          const items = Array.from({ length: count }, () => ({
            type: "layoutItem",
            content: [{ type: "paragraph" }],
          }));
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                display: options.display || "grid",
                gridCols: count,
              },
              content: items,
            })
            .run();
        },
    };
  },
});
