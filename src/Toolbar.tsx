"use client";

import { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  BarChart3,
  Blocks,
  Bold,
  CheckSquare,
  ChevronDown,
  Code,
  CodeXml,
  Columns,
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
  ListTree,
  Minus,
  MoreHorizontal,
  MousePointerClick,
  Outdent,
  Palette,
  Paperclip,
  PenLine,
  PenTool,
  Plus,
  Quote,
  Redo,
  RemoveFormatting,
  Search,
  Sigma,
  Sparkles,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Underline,
  Undo,
  Unlink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaYoutube } from "react-icons/fa";

import type { TocItem } from "./extensions";
import { cn } from "./lib/utils";
import { FAQ_PATTERN_CONTENT } from "./SlashCommand";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ToolbarProps {
  editor: Editor | null;
  onImageUpload?: () => void;
  onFileUpload?: () => void;
  onSignature?: () => void;
  isFindReplaceOpen: boolean;
  setIsFindReplaceOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isAiGeneratorOpen: boolean;
  setIsAiGeneratorOpen: (open: boolean) => void;
  isLinkPopoverOpen: boolean;
  setIsLinkPopoverOpen: (open: boolean) => void;
  isSourceMode: boolean;
  setIsSourceMode: (mode: boolean) => void;
  isSimple?: boolean;
  showAiGenerator?: boolean;
  tocItems: TocItem[];
  onTocNavigate: (item: TocItem) => void;
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
  <Tooltip delayDuration={300}>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        disabled={disabled}
        aria-label={title}
        className={cn(
          "h-8 w-8 p-0",
          active && "bg-accent text-accent-foreground",
          className,
        )}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
      {title}
    </TooltipContent>
  </Tooltip>
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

const HEADING_DEFAULT_PX: Record<number, number> = {
  1: 36,
  2: 30,
  3: 24,
  4: 20,
  5: 18,
  6: 16,
};

function getEffectiveFontSize(editor: Editor): number {
  const explicit = editor.getAttributes("textStyle").fontSize;
  if (explicit) {
    const parsed = parseInt(String(explicit), 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  for (let level = 1; level <= 6; level++) {
    if (editor.isActive("heading", { level })) {
      return HEADING_DEFAULT_PX[level] ?? 16;
    }
  }
  return 16;
}

export function Toolbar({
  editor,
  onImageUpload,
  onFileUpload,
  onSignature,
  setIsFindReplaceOpen,
  setIsShortcutsOpen,
  setIsAiGeneratorOpen,
  isLinkPopoverOpen,
  setIsLinkPopoverOpen,
  isSourceMode,
  setIsSourceMode,
  isSimple = false,
  showAiGenerator = false,
  tocItems,
  onTocNavigate,
}: ToolbarProps) {
  // Local state for link input in popover
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);

  // YouTube Popover State
  const [isYoutubeOpen, setIsYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Force re-render of the toolbar when the editor's state changes
  // We do this locally instead of in RichTextEditor to prevent infinite loops.
  const [, forceUpdate] = useState({});
  useEffect(() => {
    if (!editor) return;
    const update = () => forceUpdate({});
    editor.on("transaction", update);
    return () => {
      editor.off("transaction", update);
    };
  }, [editor]);

  if (!editor) return null;

  const fontSize = getEffectiveFontSize(editor);
  const isHeadingActive = editor.isActive("heading");
  const isBoldActive = isHeadingActive
    ? editor.getAttributes("textStyle").fontWeight !== "400"
    : editor.isActive("bold");

  const handleToggleBold = () => {
    if (isHeadingActive) {
      if (isBoldActive) {
        editor.chain().focus().setFontWeight("400").run();
      } else {
        editor.chain().focus().unsetFontWeight().run();
      }
    } else {
      editor.chain().focus().toggleBold().run();
    }
  };

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
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 p-2 sticky top-0 z-20 backdrop-blur-sm max-w-full",
          isSimple ? "bg-transparent" : "border-b border-border bg-muted/30",
        )}
      >
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

        <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
          <Select
            value={getCurrentHeading()}
            onValueChange={handleHeadingChange}
          >
            <SelectTrigger
              onMouseDown={(e) => e.preventDefault()}
              className="h-8 w-32.5"
            >
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
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSize = Math.max(8, fontSize - 1);
                    editor.chain().focus().setFontSize(`${newSize}px`).run();
                  }}
                  title="Decrease Font Size"
                  className="h-full w-8 p-0 rounded-none border-r border-border hover:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                Decrease Font Size
              </TooltipContent>
            </Tooltip>
            <input
              type="number"
              min="8"
              max="72"
              value={fontSize}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 8) {
                  editor.chain().focus().setFontSize(`${value}px`).run();
                }
              }}
              className="h-full w-10 text-xs text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              title="Font Size (px)"
            />
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSize = Math.min(72, fontSize + 1);
                    editor.chain().focus().setFontSize(`${newSize}px`).run();
                  }}
                  title="Increase Font Size"
                  className="h-full w-8 p-0 rounded-none border-l border-border hover:bg-muted"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                Increase Font Size
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center">
            {/* Text Color */}
            <Popover open={isTextColorOpen} onOpenChange={setIsTextColorOpen}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label="Text Color"
                    >
                      <Palette
                        className="h-4 w-4"
                        style={{
                          color:
                            editor.getAttributes("textStyle").color ||
                            "currentColor",
                        }}
                      />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                  Text Color
                </TooltipContent>
              </Tooltip>
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
                        className="h-8 w-full p-0 border border-border rounded-md cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
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
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label="Highlight"
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
                </TooltipTrigger>
                <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                  Highlight
                </TooltipContent>
              </Tooltip>
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
                        className="h-8 w-full p-0 border border-border rounded-md cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
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
            onClick={handleToggleBold}
            active={isBoldActive}
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
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="More Formatting"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                More Formatting
              </TooltipContent>
            </Tooltip>
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
                onClick={() => editor.chain().focus().toggleSubscript().run()}
              >
                <Subscript className="mr-2 h-4 w-4" />
                <span>Subscript (Ctrl+,)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
              >
                <Superscript className="mr-2 h-4 w-4" />
                <span>Superscript (Ctrl+.)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .unsetAllMarks()
                    .setParagraph()
                    .unsetTextAlign()
                    .run()
                }
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
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-auto px-2"
                    aria-label="Alignment"
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
              </TooltipTrigger>
              <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                Alignment
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
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
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
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
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-auto px-2"
                    aria-label="Lists & Indent"
                  >
                    <List className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                Lists & Indent
              </TooltipContent>
            </Tooltip>
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
                onClick={() => editor.chain().focus().toggleTaskList().run()}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                <span>Task List</span>
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
            <Popover
              open={isLinkPopoverOpen}
              onOpenChange={setIsLinkPopoverOpen}
            >
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        editor.isActive("link") &&
                          "bg-accent text-accent-foreground",
                      )}
                      aria-label="Link"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                  Link
                </TooltipContent>
              </Tooltip>
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
                        setLinkUrl("");
                        setLinkTitle("");
                        setIsLinkPopoverOpen(false);
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
            <Dialog open={isYoutubeOpen} onOpenChange={setIsYoutubeOpen}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label="Add YouTube Video"
                    >
                      <FaYoutube className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                  Add YouTube Video
                </TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add YouTube Video</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">YouTube URL</label>
                    <Input
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtu.be/..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addYoutubeVideo();
                      }}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the video link above to embed it.
                    </p>
                  </div>
                  <Button
                    onMouseDown={(e) => e.preventDefault()}
                    type="button"
                    onClick={addYoutubeVideo}
                  >
                    Embed Video
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-auto px-2"
                      aria-label="Insert Items"
                    >
                      <Plus className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                  Insert Items
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start">
                {/* Editorial: text-authoring elements (headings/lists/task
                    list live on their own toolbar controls already, so this
                    submenu only covers what previously lived flat here). */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <PenLine className="mr-2 h-4 w-4" />
                    <span>Editorial</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                      }
                    >
                      <Quote className="mr-2 h-4 w-4" />
                      <span>Blockquote</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                      }
                    >
                      <FileCode className="mr-2 h-4 w-4" />
                      <span>Code Block</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => editor.chain().focus().setEquation().run()}
                    >
                      <Sigma className="mr-2 h-4 w-4" />
                      <span>Equation</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Blocks: structural/media units. More block types (Button,
                    Chart, Columns, File Upload, Signature) land here in
                    later phases. */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Blocks className="mr-2 h-4 w-4" />
                    <span>Blocks</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
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
                      onClick={() => editor.chain().focus().setButtonBlock().run()}
                    >
                      <MousePointerClick className="mr-2 h-4 w-4" />
                      <span>Button</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => editor.chain().focus().setChartBlock().run()}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Chart</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => editor.chain().focus().setColumns(2).run()}
                    >
                      <Columns className="mr-2 h-4 w-4" />
                      <span>2 Columns</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => editor.chain().focus().setColumns(3).run()}
                    >
                      <Columns className="mr-2 h-4 w-4" />
                      <span>3 Columns</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Patterns: pre-built canned insertions built from existing
                    node types (no new schema). */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Patterns</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().insertContent(FAQ_PATTERN_CONTENT).run()
                      }
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>FAQ</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                >
                  <Minus className="mr-2 h-4 w-4" />
                  <span>Horizontal Rule</span>
                </DropdownMenuItem>
                {onFileUpload && (
                  <DropdownMenuItem onClick={() => onFileUpload()}>
                    <Paperclip className="mr-2 h-4 w-4" />
                    <span>Upload File</span>
                  </DropdownMenuItem>
                )}
                {onSignature && (
                  <DropdownMenuItem onClick={() => onSignature()}>
                    <PenTool className="mr-2 h-4 w-4" />
                    <span>Signature</span>
                  </DropdownMenuItem>
                )}
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
            {/* Table of Contents */}
            <Popover>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label="Table of Contents"
                    >
                      <ListTree className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                  Table of Contents
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-64 p-2" align="start">
                {tocItems.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                    No headings yet — add a Heading to build a table of
                    contents.
                  </p>
                ) : (
                  <div className="max-h-72 space-y-0.5 overflow-y-auto">
                    {tocItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => onTocNavigate(item)}
                        style={{
                          paddingLeft: `${(item.originalLevel - 1) * 12 + 8}px`,
                        }}
                        className={cn(
                          "block w-full truncate rounded-sm py-1.5 pr-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                          item.isActive
                            ? "bg-accent/60 font-medium text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                        title={item.textContent}
                      >
                        {item.textContent || "Untitled heading"}
                      </button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>

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
    </TooltipProvider>
  );
}
