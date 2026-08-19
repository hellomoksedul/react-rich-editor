"use client";

import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Code,
  Eraser,
  Highlighter,
  Italic,
  Link as LinkIcon,
  Palette,
  Strikethrough,
  Underline,
  Unlink,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
}

export function InlineBubbleMenu({ editor }: InlineBubbleMenuProps) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);

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
            editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
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
        {/* Text Color Popover */}
        <Popover open={isColorOpen} onOpenChange={setIsColorOpen}>
          <PopoverTrigger asChild>
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
          </PopoverTrigger>
          <PopoverContent className="w-52 p-3" align="center">
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
                  className="h-8 w-full p-0 border border-border rounded-md cursor-pointer overflow-hidden flex-1 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Popover */}
        <Popover open={isHighlightOpen} onOpenChange={setIsHighlightOpen}>
          <PopoverTrigger asChild>
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
          </PopoverTrigger>
          <PopoverContent className="w-52 p-3" align="center">
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
                  className="h-8 w-full p-0 border border-border rounded-md cursor-pointer overflow-hidden flex-1 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-0.5 pl-1">
        {/* Link Popover */}
        <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <PopoverTrigger asChild>
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
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2" align="center">
            <div className="flex flex-col gap-2">
              <div className="space-y-1">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="h-8 text-xs"
                />
                <Input
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
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
          </PopoverContent>
        </Popover>
      </div>
    </BubbleMenu>
  );
}
