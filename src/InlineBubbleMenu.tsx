"use client";

import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignLeft,
  ArrowDownRight,
  ArrowUpRight,
  Bold,
  CheckCircle,
  ChevronDown,
  Code,
  Eraser,
  Highlighter,
  Italic,
  Languages,
  Link as LinkIcon,
  Palette,
  Strikethrough,
  Underline,
  Unlink,
  Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AIIcon } from "./AIIcon";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const PRESET_COLORS = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#6b7280",
];

interface InlineBubbleMenuProps {
  editor: Editor | null;
  onInlineAiAction?: (action: string) => void;
}

export function InlineBubbleMenu({
  editor,
  onInlineAiAction,
}: InlineBubbleMenuProps) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);

  // Sync link url when popover opens
  useEffect(() => {
    if (isLinkOpen && editor) {
      const previousUrl = editor.getAttributes("link").href;
      const previousTitle = editor.getAttributes("link").title;
      setLinkUrl(previousUrl || "");
      setLinkTitle(previousTitle || "");
    }
  }, [isLinkOpen, editor]);

  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor, state }) => {
        if (!editor.isEditable) return false;
        if (editor.isActive("image")) return false;

        // Don't hide if the link or color popover is open
        if (isLinkOpen || isColorOpen || isHighlightOpen || isAskAiOpen)
          return true;

        const { from, to } = state.selection;
        const isEmpty = from === to;
        const isTable = editor.isActive("table");
        const isImage = editor.isActive("image");
        const isYoutube = editor.isActive("youtube");
        const isChart = editor.isActive("chartBlock");
        const isButton = editor.isActive("buttonBlock");

        return (
          !isEmpty &&
          !isTable &&
          !isImage &&
          !isYoutube &&
          !isChart &&
          !isButton
        );
      }}
      className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg"
    >
      <div className="flex items-center gap-0.5 border-r border-border pr-1">
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${
            (editor.isActive("heading")
              ? editor.getAttributes("textStyle").fontWeight !== "400"
              : editor.isActive("bold"))
              ? "bg-accent text-accent-foreground"
              : ""
          }`}
          onClick={() => {
            if (editor.isActive("heading")) {
              if (editor.getAttributes("textStyle").fontWeight !== "400") {
                editor.chain().focus().setFontWeight("400").run();
              } else {
                editor.chain().focus().unsetFontWeight().run();
              }
            } else {
              editor.chain().focus().toggleBold().run();
            }
          }}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${
            editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${
            editor.isActive("underline")
              ? "bg-accent text-accent-foreground"
              : ""
          }`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${
            editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""
          }`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${
            editor.isActive("code") ? "bg-accent text-accent-foreground" : ""
          }`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-border pr-1 pl-1">
        {/* Text Color Dropdown */}
        <DropdownMenu
          open={isColorOpen}
          onOpenChange={setIsColorOpen}
          modal={false}
        >
          <DropdownMenuTrigger asChild>
            <Button
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Text Color"
            >
              <Palette
                className="h-4 w-4"
                style={{
                  color:
                    editor.getAttributes("textStyle").color || "currentColor",
                }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent disablePortal={true}
            className="w-52 p-3"
            align="center"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-md border border-border cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setIsColorOpen(false);
                    }}
                    title={color}
                  />
                ))}
                <button
                  className="w-6 h-6 rounded-md border border-border cursor-pointer flex items-center justify-center hover:bg-muted"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setIsColorOpen(false);
                  }}
                  title="Clear Color"
                >
                  <Eraser className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={editor.getAttributes("textStyle").color || "#000000"}
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8 w-full p-0 border border-border rounded-md cursor-pointer overflow-hidden flex-1 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Highlight Dropdown */}
        <DropdownMenu
          open={isHighlightOpen}
          onOpenChange={setIsHighlightOpen}
          modal={false}
        >
          <DropdownMenuTrigger asChild>
            <Button
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Highlight Color"
            >
              <Highlighter
                className="h-4 w-4"
                style={{
                  color: editor.isActive("highlight")
                    ? editor.getAttributes("highlight").color
                    : "currentColor",
                }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent disablePortal={true}
            className="w-52 p-3"
            align="center"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-md border border-border cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color }).run();
                      setIsHighlightOpen(false);
                    }}
                    title={color}
                  />
                ))}
                <button
                  className="w-6 h-6 rounded-md border border-border cursor-pointer flex items-center justify-center hover:bg-muted"
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setIsHighlightOpen(false);
                  }}
                  title="Clear Highlight"
                >
                  <Eraser className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={editor.getAttributes("highlight").color || "#ffeebb"}
                  onChange={(e) => {
                    editor
                      .chain()
                      .focus()
                      .toggleHighlight({ color: e.target.value })
                      .run();
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8 w-full p-0 border border-border rounded-md cursor-pointer overflow-hidden flex-1 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-0.5 pl-1">
        {/* Link Dropdown */}
        <DropdownMenu
          open={isLinkOpen}
          onOpenChange={setIsLinkOpen}
          modal={false}
        >
          <DropdownMenuTrigger asChild>
            <Button
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${
                editor.isActive("link")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent disablePortal={true}
            className="w-60 p-2"
            align="center"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-2">
              <div className="space-y-1">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="https://example.com"
                  className="h-8 text-xs"
                />
                <Input
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Link title (optional)..."
                  className="h-8 text-xs"
                />
              </div>
              <Button
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                size="sm"
                className="h-8 w-full"
                onClick={() => {
                  if (linkUrl) {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({ href: linkUrl, title: linkTitle } as any)
                      .run();
                    setIsLinkOpen(false);
                  }
                }}
              >
                Set Link
              </Button>
            </div>
            {editor.isActive("link") && (
              <Button
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                variant="ghost"
                size="sm"
                className="w-full mt-2 h-8 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setIsLinkOpen(false);
                }}
              >
                <Unlink className="h-3 w-3 mr-2" /> Remove Link
              </Button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-5 bg-border mx-1" />
        <DropdownMenu
          open={isAskAiOpen}
          onOpenChange={setIsAskAiOpen}
          modal={false}
        >
          <DropdownMenuTrigger asChild>
            <Button
              onMouseDown={(e) => e.preventDefault()}
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 gap-1 ml-1 text-xs font-medium")}
              aria-label="AI Actions"
            >
              <AIIcon className="h-3 w-3" />
              <span>AI</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent disablePortal={true}
            onCloseAutoFocus={(e) => e.preventDefault()}
            align="end"
            className="w-56 p-1.5"
          >
            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Refine
            </div>
            <DropdownMenuItem
              onClick={() => onInlineAiAction?.("fix_grammar")}
              className="cursor-pointer"
            >
              <CheckCircle className="mr-2 h-4 w-4 opacity-70" />
              <span>Fix Grammar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onInlineAiAction?.("simplify")}
              className="cursor-pointer"
            >
              <Wand2 className="mr-2 h-4 w-4 opacity-70" />
              <span>Simplify</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onInlineAiAction?.("complete_sentence")}
              className="cursor-pointer mb-1"
            >
              <AlignLeft className="mr-2 h-4 w-4 opacity-70" />
              <span>Complete Sentence</span>
            </DropdownMenuItem>

            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Rewrite
            </div>
            <DropdownMenuItem
              onClick={() => onInlineAiAction?.("make_longer")}
              className="cursor-pointer"
            >
              <ArrowUpRight className="mr-2 h-4 w-4 opacity-70" />
              <span>Make Longer</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onInlineAiAction?.("make_shorter")}
              className="cursor-pointer"
            >
              <ArrowDownRight className="mr-2 h-4 w-4 opacity-70" />
              <span>Make Shorter</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onInlineAiAction?.("translate")}
              className="cursor-pointer mb-1"
            >
              <Languages className="mr-2 h-4 w-4 opacity-70" />
              <span>Translate</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </BubbleMenu>
  );
}
