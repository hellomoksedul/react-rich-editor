"use client";

import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Columns,
  Eraser,
  PaintBucket,
  Rows,
  Trash2,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface TableBubbleMenuProps {
  editor: Editor | null;
}

const CELL_COLORS = [
  { name: "None", value: "" },
  { name: "Red", value: "#fca5a5" },
  { name: "Orange", value: "#fdba74" },
  { name: "Yellow", value: "#fde047" },
  { name: "Green", value: "#86efac" },
  { name: "Blue", value: "#93c5fd" },
  { name: "Purple", value: "#d8b4fe" },
  { name: "Gray", value: "#d1d5db" },
];

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  if (!editor) return null;

  const setCellBackground = (color: string) => {
    if (color) {
      editor.chain().focus().setCellAttribute("backgroundColor", color).run();
    } else {
      editor.chain().focus().setCellAttribute("backgroundColor", null).run();
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => {
        return editor.isActive("table");
      }}
      className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg"
    >
      <div className="flex items-center gap-0.5 border-r border-border pr-1">
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          title="Add Column Before"
        >
          <ArrowLeftToLine className="h-4 w-4" />
        </Button>
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="Add Column After"
        >
          <ArrowRightToLine className="h-4 w-4" />
        </Button>
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          title="Delete Column"
        >
          <Columns className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          title="Add Row Before"
        >
          <ArrowUpToLine className="h-4 w-4" />
        </Button>
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="Add Row After"
        >
          <ArrowDownToLine className="h-4 w-4" />
        </Button>
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().deleteRow().run()}
          title="Delete Row"
        >
          <Rows className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button onMouseDown={(e) => e.preventDefault()} 
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Cell Background Color"
            >
              <PaintBucket className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" align="center">
            <div className="grid grid-cols-4 gap-1">
              {CELL_COLORS.map((color) => (
                <button onMouseDown={(e) => e.preventDefault()} 
                  type="button"
                  key={color.name}
                  onClick={() => setCellBackground(color.value)}
                  className={`h-6 w-6 rounded-sm border border-border ${
                    color.value === "" ? "bg-background" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {color.value === "" && (
                    <span className="block h-full w-full rotate-45 border-t border-muted-foreground/50" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => {
            editor
              .chain()
              .focus()
              .setCellAttribute("backgroundColor", null)
              .run();
          }}
          title="Clear Cell Color"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className={`h-7 w-7 p-0 ${editor.getAttributes("table").fullWidth ? "bg-accent text-accent-foreground" : ""}`}
          onClick={() => {
            const isFullWidth = editor.getAttributes("table").fullWidth;
            editor.chain().focus().updateAttributes("table", { fullWidth: !isFullWidth }).run();
          }}
          title={editor.getAttributes("table").fullWidth ? "Fit to content" : "Full width"}
        >
          {editor.getAttributes("table").fullWidth ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-0.5 pl-1">
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().mergeCells().run()}
          title="Merge/Split"
        >
          <span className="text-xs font-bold px-1">M</span>
        </Button>
        <Button onMouseDown={(e) => e.preventDefault()} 
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="Delete Table"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </BubbleMenu>
  );
}
