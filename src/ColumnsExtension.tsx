"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { Plus } from "lucide-react";

export type ColumnsLayout = "equal-2" | "equal-3" | "sidebar-left" | "sidebar-right";

export interface ColumnGroupOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columnGroup: {
      /** Insert a new multi-column layout block (2 or 3 columns). */
      setColumns: (count?: 2 | 3) => ReturnType;
    };
  }
}

/** Builds the grid-template-columns value for a layout. When `columnCount`
 * is passed and doesn't match the number of tracks the named layout implies
 * (e.g. stored/legacy content whose `layout` attribute fell out of sync with
 * its actual column count), falls back to an even `1fr` split across
 * however many columns really exist — so the group always renders as a real
 * side-by-side grid instead of silently collapsing to a single stacked
 * column. */
export function layoutToTemplate(layout: ColumnsLayout, columnCount?: number): string {
  const named = (() => {
    switch (layout) {
      case "equal-3":
        return "1fr 1fr 1fr";
      case "sidebar-left":
        return "1fr 2fr";
      case "sidebar-right":
        return "2fr 1fr";
      default:
        return "1fr 1fr";
    }
  })();

  if (!columnCount) return named;
  const namedTrackCount = named.trim().split(/\s+/).length;
  if (namedTrackCount === columnCount) return named;
  return Array.from({ length: columnCount }, () => "1fr").join(" ");
}

function ColumnGroupView({ node }: NodeViewProps) {
  const layout: ColumnsLayout = node.attrs.layout || "equal-2";
  return (
    <NodeViewWrapper data-column-group-wrapper="" className="my-2">
      {/* display/gap are set inline (not via Tailwind utility classes) so
       * the grid layout never depends on those classes having been scanned
       * into the compiled stylesheet — the column count is read straight
       * off the node, so it's also self-correcting for any stored content
       * whose layout attribute doesn't match its real child count. */}
      <NodeViewContent
        style={{
          display: "grid",
          gridTemplateColumns: layoutToTemplate(layout, node.childCount),
          gap: "1rem",
        }}
      />
    </NodeViewWrapper>
  );
}

/** A single column inside a ColumnGroup. Renders a "COL N" label plus a
 * hover-revealed "+ Block" button (mirroring the reference design) above the
 * column's actual content. Content can still also be added the same way as
 * anywhere else in the document (the "/" slash menu and the toolbar's Insert
 * menu both work with the cursor inside a column) — the button is a
 * shortcut, not the only way in. */
function ColumnView({ node, editor, getPos }: NodeViewProps) {
  const pos = typeof getPos === "function" ? getPos() : null;
  let index = 0;
  if (pos != null) {
    const resolved = editor.state.doc.resolve(pos);
    index = resolved.index(resolved.depth);
  }

  const addBlock = () => {
    if (pos == null) return;
    const endPos = pos + node.nodeSize - 1;
    editor.chain().focus().insertContentAt(endPos, { type: "paragraph" }).run();
  };

  return (
    <NodeViewWrapper data-column-wrapper="" className="hellokit-column group/column">
      {editor.isEditable && (
        <div className="mb-1.5 flex items-center justify-between" contentEditable={false}>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Col {index + 1}
          </span>
          <button
            type="button"
            onClick={addBlock}
            className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover/column:opacity-100"
          >
            <Plus className="h-3 w-3" /> Block
          </button>
        </div>
      )}
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

export const Column = Node.create({
  name: "column",
  content: "block+",
  isolating: true,

  parseHTML() {
    return [{ tag: "div[data-column]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-column": "", class: "hellokit-column" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnView);
  },
});

/** A multi-column layout block. Layout changes (equal-2/equal-3/sidebar-left/
 * sidebar-right) happen via ColumnsMenu's icon picker, not free dragging —
 * drag-to-resize columns is out of scope for v1 (see the advanced-features
 * plan). Switching layout is restricted to variants matching the current
 * column count, since e.g. going from a 3-column group to "sidebar-left"
 * (which expects 2) would require restructuring content rather than just
 * re-flowing CSS. */
export const ColumnGroup = Node.create<ColumnGroupOptions>({
  name: "columnGroup",
  group: "block",
  content: "column{2,4}",
  draggable: true,
  isolating: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      layout: {
        default: "equal-2" as ColumnsLayout,
        parseHTML: (element) => element.getAttribute("data-layout") || "equal-2",
        renderHTML: (attributes) => ({ "data-layout": attributes.layout }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-column-group]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-column-group": "" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnGroupView);
  },

  addCommands() {
    return {
      setColumns:
        (count = 2) =>
        ({ chain }) => {
          const columns = Array.from({ length: count }, () => ({
            type: "column",
            content: [{ type: "paragraph" }],
          }));
          return chain()
            .insertContent({
              type: this.name,
              attrs: { layout: count === 3 ? "equal-3" : "equal-2" },
              content: columns,
            })
            .run();
        },
    };
  },
});
