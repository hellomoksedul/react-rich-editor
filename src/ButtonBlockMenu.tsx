"use client";

import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Link2,
  Palette,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ButtonBlockMenuProps {
  editor: Editor | null;
}

const RADIUS_OPTIONS: { value: "none" | "sm" | "full"; label: string }[] = [
  { value: "none", label: "Square" },
  { value: "sm", label: "Rounded" },
  { value: "full", label: "Pill" },
];

function RadiusIcon({ radius }: { radius: "none" | "sm" | "full" }) {
  return (
    <span
      className={cn(
        "block h-3.5 w-3.5 border-2 border-current",
        radius === "full"
          ? "rounded-full"
          : radius === "sm"
            ? "rounded-sm"
            : "rounded-none",
      )}
    />
  );
}

const COLOR_SWATCHES = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ea580c",
  "#7c3aed",
  "#0f172a",
];

/** Finds the buttonBlock node + its position containing the current selection,
 * regardless of whether the selection is a NodeSelection on the block itself
 * or a TextSelection inside its label. */
function findButtonBlock(editor: Editor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === "buttonBlock") {
      return { node, pos: $from.before(depth) };
    }
  }
  return null;
}

export function ButtonBlockMenu({ editor }: ButtonBlockMenuProps) {
  const [hrefDraft, setHrefDraft] = useState("");

  if (!editor) return null;

  const update = (patch: Record<string, any>) =>
    editor.chain().focus().updateAttributes("buttonBlock", patch).run();

  const duplicate = () => {
    const found = findButtonBlock(editor);
    if (!found) return;
    const after = found.pos + found.node.nodeSize;
    editor.chain().focus().insertContentAt(after, found.node.toJSON()).run();
  };

  const remove = () => {
    const found = findButtonBlock(editor);
    if (!found) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: found.pos, to: found.pos + found.node.nodeSize })
      .run();
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isActive("buttonBlock")}
      className="hellokit-editor-scope flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg"
    >
      <div className="flex items-center gap-0.5 border-r border-border pr-1">
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs w-15" // Fixed width to prevent jumping
          onClick={() => {
            const current = editor.getAttributes("buttonBlock").variant;
            update({ variant: current === "outline" ? "filled" : "outline" });
          }}
          title="Toggle Style"
        >
          {editor.getAttributes("buttonBlock").variant === "outline"
            ? "Outline"
            : "Filled"}
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            const current = editor.getAttributes("buttonBlock").align;
            const next =
              current === "left"
                ? "center"
                : current === "center"
                  ? "right"
                  : "left";
            update({ align: next });
          }}
          title="Toggle Alignment"
        >
          {editor.getAttributes("buttonBlock").align === "center" ? (
            <AlignCenter className="h-4 w-4" />
          ) : editor.getAttributes("buttonBlock").align === "right" ? (
            <AlignRight className="h-4 w-4" />
          ) : (
            <AlignLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            const current = editor.getAttributes("buttonBlock").radius;
            const next =
              current === "none" ? "sm" : current === "sm" ? "full" : "none";
            update({ radius: next });
          }}
          title="Toggle Corner Radius"
        >
          <RadiusIcon
            radius={editor.getAttributes("buttonBlock").radius || "sm"}
          />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Button Color"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" align="center">
            <div className="grid grid-cols-6 gap-1">
              {COLOR_SWATCHES.map((color) => (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                  key={color}
                  onClick={() => update({ color })}
                  className="h-6 w-6 rounded-sm border border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover
          onOpenChange={(open) => {
            if (open)
              setHrefDraft(editor.getAttributes("buttonBlock").href || "");
          }}
        >
          <PopoverTrigger asChild>
            <Button
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Button Link"
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="center">
            <div className="flex gap-1">
              <Input
                value={hrefDraft}
                onChange={(e) => setHrefDraft(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    update({ href: hrefDraft.trim() || "#" });
                }}
                autoFocus
              />
              <Button
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                size="sm"
                onClick={() => update({ href: hrefDraft.trim() || "#" })}
              >
                Set
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-0.5 pl-1">
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={duplicate}
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={remove}
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </BubbleMenu>
  );
}
