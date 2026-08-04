"use client";

import { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code,
  CodeXml,
  Eraser,
  FileCode,
  HelpCircle,
  Highlighter,
  Image,
  Indent,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Outdent,
  Palette,
  Plus,
  Quote,
  Redo,
  RemoveFormatting,
  Search,
  Sparkles,
  Strikethrough,
  Table,
  Underline,
  Undo,
  Unlink,
} from "lucide-react";
import { useState } from "react";
import { FaYoutube } from "react-icons/fa";

import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ToolbarProps {
  editor: Editor | null;
  onImageUpload?: () => void;
  isFindReplaceOpen: boolean;
  setIsFindReplaceOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isAiGeneratorOpen: boolean;
  setIsAiGeneratorOpen: (open: boolean) => void;
  isSourceMode: boolean;
  setIsSourceMode: (mode: boolean) => void;
  isSimple?: boolean;
  showAiGenerator?: boolean;
}

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  children,
  title,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  className?: string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "h-8 w-8 p-0",
      active && "bg-accent text-accent-foreground",
      className,
    )}
  >
    {children}
  </Button>
);

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

export function Toolbar({
  editor,
  onImageUpload,
  setIsFindReplaceOpen,
  setIsShortcutsOpen,
  setIsAiGeneratorOpen,
  isSourceMode,
  setIsSourceMode,
  isSimple = false,
  showAiGenerator = false,
}: ToolbarProps) {
  // Local state for link input in popover
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);

  // YouTube Popover State
  const [isYoutubeOpen, setIsYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Font Size State
  const [fontSize, setFontSize] = useState(16);

  if (!editor) return null;

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("heading", { level: 4 })) return "h4";
    if (editor.isActive("heading", { level: 5 })) return "h5";
    if (editor.isActive("heading", { level: 6 })) return "h6";
    return "paragraph";
  };

  const handleHeadingChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const addYoutubeVideo = () => {
    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
        width: 640,
        height: 480,
      });
      setYoutubeUrl(""); // Clear input
      setIsYoutubeOpen(false); // Close popover
    }
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-1 p-2 sticky top-0 z-20 backdrop-blur-sm max-w-full",
      isSimple ? "bg-transparent" : "border-b border-border bg-muted/30"
    )}>
      {/* 
        --------------------------------------------------------
        0. HISTORY (Moved to Start)
        --------------------------------------------------------
      */}
      <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* 
        --------------------------------------------------------
        1. TYPE & SIZE
        --------------------------------------------------------
      */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
        <Select value={getCurrentHeading()} onValueChange={handleHeadingChange}>
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="paragraph"
              className="pl-2 [&>span.absolute]:hidden"
            >
              Normal
            </SelectItem>
            <SelectItem value="h1" className="pl-2 [&>span.absolute]:hidden">
              Heading 1
            </SelectItem>
            <SelectItem value="h2" className="pl-2 [&>span.absolute]:hidden">
              Heading 2
            </SelectItem>
            <SelectItem value="h3" className="pl-2 [&>span.absolute]:hidden">
              Heading 3
            </SelectItem>
            <SelectItem value="h4" className="pl-2 [&>span.absolute]:hidden">
              Heading 4
            </SelectItem>
            <SelectItem value="h5" className="pl-2 [&>span.absolute]:hidden">
              Heading 5
            </SelectItem>
            <SelectItem value="h6" className="pl-2 [&>span.absolute]:hidden">
              Heading 6
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size Controls - Inline */}
        <div className="flex items-center border border-input rounded-md h-8 overflow-hidden bg-transparent">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const newSize = Math.max(8, fontSize - 1);
              setFontSize(newSize);
              editor
                .chain()
                .focus()
                .setMark("textStyle", { fontSize: `${newSize}px` })
                .run();
            }}
            title="Decrease Font Size"
            className="h-full w-8 p-0 rounded-none border-r border-border hover:bg-muted"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <input
            type="number"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 8) {
                setFontSize(value);
                editor
                  .chain()
                  .focus()
                  .setMark("textStyle", { fontSize: `${value}px` })
                  .run();
              }
            }}
            className="h-full w-10 text-xs text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            title="Font Size (px)"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const newSize = Math.min(72, fontSize + 1);
              setFontSize(newSize);
              editor
                .chain()
                .focus()
                .setMark("textStyle", { fontSize: `${newSize}px` })
                .run();
            }}
            title="Increase Font Size"
            className="h-full w-8 p-0 rounded-none border-l border-border hover:bg-muted"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center">
          {/* Text Color */}
          <Popover open={isTextColorOpen} onOpenChange={setIsTextColorOpen}>
            <PopoverTrigger asChild>
              <Button
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
            <PopoverContent className="w-52 p-3" align="start">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-md border border-border cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setIsTextColorOpen(false);
                      }}
                      title={color}
                    />
                  ))}
                  <button
                    className="w-6 h-6 rounded-md border border-border cursor-pointer flex items-center justify-center hover:bg-muted"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run();
                      setIsTextColorOpen(false);
                    }}
                    title="Clear Color"
                  >
                    <Eraser className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="color"
                      value={
                        editor.getAttributes("textStyle").color || "#000000"
                      }
                      onChange={(e) => {
                        editor.chain().focus().setColor(e.target.value).run();
                        setIsTextColorOpen(false);
                      }}
                      className="h-8 w-full p-0 border-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder="#000000"
                    value={editor.getAttributes("textStyle").color || ""}
                    onChange={(e) =>
                      editor.chain().focus().setColor(e.target.value).run()
                    }
                    className="h-8 w-24 text-xs font-mono"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight */}
          <Popover open={isHighlightOpen} onOpenChange={setIsHighlightOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Highlight"
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
            <PopoverContent className="w-52 p-3" align="start">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-md border border-border cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor
                          .chain()
                          .focus()
                          .toggleHighlight({ color: color })
                          .run();
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
                  <div className="relative flex-1">
                    <Input
                      type="color"
                      value={
                        editor.getAttributes("highlight").color || "#ffeebb"
                      }
                      onChange={(e) => {
                        editor
                          .chain()
                          .focus()
                          .toggleHighlight({ color: e.target.value })
                          .run();
                        setIsHighlightOpen(false);
                      }}
                      className="h-8 w-full p-0 border-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder="#ffeebb"
                    value={editor.getAttributes("highlight").color || ""}
                    onChange={(e) =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: e.target.value })
                        .run()
                    }
                    className="h-8 w-24 text-xs font-mono"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 
        --------------------------------------------------------
        2. BASIC FORMATTING
        --------------------------------------------------------
      */}
      <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="More Formatting"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Underline className="mr-2 h-4 w-4" />
              <span>Underline</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="mr-2 h-4 w-4" />
              <span>Strikethrough</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="mr-2 h-4 w-4" />
              <span>Inline Code</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
            >
              <RemoveFormatting className="mr-2 h-4 w-4 text-destructive" />
              <span className="text-destructive">Clear Formatting</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 
        --------------------------------------------------------
        3. ALIGNMENT
        --------------------------------------------------------
      */}
      <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-auto px-2"
              title="Alignment"
            >
              {editor.isActive({ textAlign: "center" }) ? (
                <AlignCenter className="h-4 w-4" />
              ) : editor.isActive({ textAlign: "right" }) ? (
                <AlignRight className="h-4 w-4" />
              ) : editor.isActive({ textAlign: "justify" }) ? (
                <AlignJustify className="h-4 w-4" />
              ) : (
                <AlignLeft className="h-4 w-4" />
              )}
              <ChevronDown className="h-3 w-3 opacity-50 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="mr-2 h-4 w-4" />
              <span>Left</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter className="mr-2 h-4 w-4" />
              <span>Center</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="mr-2 h-4 w-4" />
              <span>Right</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
            >
              <AlignJustify className="mr-2 h-4 w-4" />
              <span>Justify</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 
        --------------------------------------------------------
        4. LISTS
        --------------------------------------------------------
      */}
      <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-auto px-2"
              title="Lists & Indent"
            >
              <List className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="mr-2 h-4 w-4" />
              <span>Bullet List</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="mr-2 h-4 w-4" />
              <span>Numbered List</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().sinkListItem("listItem").run()
              }
              disabled={!editor.can().sinkListItem("listItem")}
            >
              <Indent className="mr-2 h-4 w-4" />
              <span>Increase Indent</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().liftListItem("listItem").run()
              }
              disabled={!editor.can().liftListItem("listItem")}
            >
              <Outdent className="mr-2 h-4 w-4" />
              <span>Decrease Indent</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 
        --------------------------------------------------------
        5. INSERT & MEDIA
        --------------------------------------------------------
      */}
      {!isSimple && (
        <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("link") && "bg-accent text-accent-foreground",
              )}
              title="Link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2" align="start">
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
                    setLinkUrl("");
                    setLinkTitle("");
                  }
                }}
              >
                Set Link
              </Button>
            </div>
            {editor.isActive("link") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full mt-2 h-8 text-xs text-destructive hover:text-destructive"
                onClick={() => editor.chain().focus().unsetLink().run()}
              >
                <Unlink className="h-3 w-3 mr-2" /> Remove Link
              </Button>
            )}
          </PopoverContent>
        </Popover>

        <ToolbarButton onClick={() => onImageUpload?.()} title="Add Image">
          <Image className="h-4 w-4" aria-label="Image" />
        </ToolbarButton>
        <Popover open={isYoutubeOpen} onOpenChange={setIsYoutubeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Add YouTube Video"
            >
              <FaYoutube className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="flex flex-col gap-2">
              <div className="space-y-1">
                <h4 className="font-medium text-xs leading-none">
                  YouTube URL
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Enter the video link below.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addYoutubeVideo();
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={addYoutubeVideo}
                >
                  Embed
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-auto px-2"
              title="Insert Items"
            >
              <Plus className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              <Table className="mr-2 h-4 w-4" />
              <span>Table</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="mr-2 h-4 w-4" />
              <span>Blockquote</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <FileCode className="mr-2 h-4 w-4" />
              <span>Code Block</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <Minus className="mr-2 h-4 w-4" />
              <span>Horizontal Rule</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      )}

      {/* 
        --------------------------------------------------------
        6. TOOLS & UTILITIES
        --------------------------------------------------------
      */}
      {!isSimple && (
        <div className="flex items-center gap-0.5">
        {/* Find & Replace */}
        <ToolbarButton
          onClick={() => setIsFindReplaceOpen(true)}
          title="Find & Replace (Ctrl+F)"
        >
          <Search className="h-4 w-4" />
        </ToolbarButton>

        {/* Keyboard Shortcuts */}
        <ToolbarButton
          onClick={() => setIsShortcutsOpen(true)}
          title="Keyboard Shortcuts"
        >
          <HelpCircle className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => setIsSourceMode(!isSourceMode)}
          active={isSourceMode}
          title="Source Code"
        >
          <CodeXml className="h-4 w-4" />
        </ToolbarButton>

        {showAiGenerator && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <ToolbarButton
              onClick={() => setIsAiGeneratorOpen(true)}
              title="AI Content Generator"
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
            </ToolbarButton>
          </>
        )}
      </div>
      )}
    </div>
  );
}
