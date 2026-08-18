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

/** A tiny swatch that visually previews the corner radius it represents,
 * rather than a text label ("Square"/"Rounded"/"Pill") — mirrors the
 * icon-based radius picker in the reference design. */
function RadiusIcon({ radius }: { radius: "none" | "sm" | "full" }) {
  return (
    <span
      className={cn(
        "block h-3.5 w-3.5 border-2 border-current",
        radius === "full" ? "rounded-full" : radius === "sm" ? "rounded-[4px]" : "rounded-none",
      )}
    />
  );
}

const COLOR_SWATCHES = ["#2563eb", "#16a34a", "#dc2626", "#ea580c", "#7c3aed", "#0f172a"];

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
      className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg"
    >
      <div className="flex items-center gap-0.5 border-r border-border pr-1">
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs",
            editor.getAttributes("buttonBlock").variant !== "outline" && "bg-accent",
          )}
          onClick={() => update({ variant: "filled" })}
        >
          Filled
        </Button>
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs",
            editor.getAttributes("buttonBlock").variant === "outline" && "bg-accent",
          )}
          onClick={() => update({ variant: "outline" })}
        >
          Outline
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => update({ align: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => update({ align: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => update({ align: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        {RADIUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onMouseDown={(e) => e.preventDefault()}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              editor.getAttributes("buttonBlock").radius === option.value && "bg-accent",
            )}
            onClick={() => update({ radius: option.value })}
            title={option.label}
          >
            <RadiusIcon radius={option.value} />
          </Button>
        ))}
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
            if (open) setHrefDraft(editor.getAttributes("buttonBlock").href || "");
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
                  if (e.key === "Enter") update({ href: hrefDraft.trim() || "#" });
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
