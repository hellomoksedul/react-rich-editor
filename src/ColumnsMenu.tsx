"use client";

import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Trash2, Ungroup } from "lucide-react";
import { layoutToTemplate, type ColumnsLayout } from "./ColumnsExtension";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";

interface ColumnsMenuProps {
  editor: Editor | null;
}

const LAYOUTS_BY_COUNT: Record<number, { value: ColumnsLayout; label: string }[]> = {
  2: [
    { value: "equal-2", label: "2 Col" },
    { value: "sidebar-left", label: "Sidebar L" },
    { value: "sidebar-right", label: "Sidebar R" },
  ],
  3: [{ value: "equal-3", label: "3 Col" }],
};

/** A tiny grid swatch previewing a layout's real column proportions (via
 * layoutToTemplate), instead of a text label ("Sidebar L" etc). */
function LayoutIcon({ layout }: { layout: ColumnsLayout }) {
  const template = layoutToTemplate(layout);
  const tracks = template.split(" ");
  return (
    <span className="grid h-4 w-6 gap-0.5" style={{ gridTemplateColumns: template }}>
      {tracks.map((_, i) => (
        <span key={i} className="rounded-[2px] bg-current opacity-70" />
      ))}
    </span>
  );
}

/** Finds the columnGroup node + its position containing the current
 * selection, wherever inside the group the cursor happens to be. */
function findColumnGroup(editor: Editor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === "columnGroup") {
      return { node, pos: $from.before(depth) };
    }
  }
  return null;
}

export function ColumnsMenu({ editor }: ColumnsMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isActive("columnGroup")}
      className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg"
    >
      {(() => {
        const found = findColumnGroup(editor);
        if (!found) return null;
        const layoutOptions = LAYOUTS_BY_COUNT[found.node.childCount] || [];
        const currentLayout = found.node.attrs.layout as ColumnsLayout;

        const unwrap = () => {
          const target = findColumnGroup(editor);
          if (!target) return;
          const blocks: any[] = [];
          target.node.forEach((column) => {
            column.forEach((block) => blocks.push(block.toJSON()));
          });
          editor
            .chain()
            .focus()
            .insertContentAt({ from: target.pos, to: target.pos + target.node.nodeSize }, blocks)
            .run();
        };

        return (
          <>
            {layoutOptions.length > 0 && (
              <div className="flex items-center gap-0.5 border-r border-border pr-1">
                {layoutOptions.map((option) => (
                  <Button
                    key={option.value}
                    onMouseDown={(e) => e.preventDefault()}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0",
                      currentLayout === option.value && "bg-accent",
                    )}
                    onClick={() =>
                      editor.chain().focus().updateAttributes("columnGroup", { layout: option.value }).run()
                    }
                    title={option.label}
                  >
                    <LayoutIcon layout={option.value} />
                  </Button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-0.5 pl-1">
              <Button
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Unwrap columns"
                onClick={unwrap}
              >
                <Ungroup className="h-4 w-4" />
              </Button>
              <Button
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Delete Columns"
                onClick={() => {
                  const target = findColumnGroup(editor);
                  if (!target) return;
                  editor
                    .chain()
                    .focus()
                    .deleteRange({ from: target.pos, to: target.pos + target.node.nodeSize })
                    .run();
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </>
        );
      })()}
    </BubbleMenu>
  );
}
