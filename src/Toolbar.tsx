"use client";

import { Editor } from "@tiptap/react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Blocks,
  Bold,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Code,
  CodeXml,
  Columns,
  Eraser,
  Eye,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  HelpCircle,
  Highlighter,
  Image,
  ImagePlus,
  Indent,
  Italic,
  Languages,
  Link,
  List,
  ListOrdered,
  ListTree,
  MessageSquarePlus,
  Minus,
  MoreHorizontal,
  MousePointerClick,
  MoveVertical,
  Outdent,
  Palette,
  Paperclip,
  PenLine,
  PenTool,
  Pilcrow,
  Plus,
  Quote,
  Redo,
  RemoveFormatting,
  Search,
  Sigma,
  Smile,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Underline,
  Undo,
  Unlink,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaYoutube } from "react-icons/fa";

import { AIIcon } from "./AIIcon";
import { DEFAULT_CHART_POINTS } from "./ChartBlockExtension";
import { EditChartDialog } from "./EditChartDialog";
import { EquationEditDialog } from "./EquationEditDialog";
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
  isAskAiOpen: boolean;
  setIsAskAiOpen: (open: boolean) => void;
  isLinkPopoverOpen: boolean;
  setIsLinkPopoverOpen: (open: boolean) => void;
  isSourceMode: boolean;
  setIsSourceMode: (mode: boolean) => void;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  isSimple?: boolean;
  tocItems: TocItem[];
  onTocNavigate: (item: TocItem) => void;
  onInlineAiAction?: (action: string) => void;
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

const FONTS = [
  "DM Sans",
  "Geist",
  "Inter",
  "Poppins",
  "Manrope",
  "Plus Jakarta Sans",
  "Public Sans",
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Oswald",
  "Source Sans Pro",
  "Raleway",
  "PT Sans",
  "Noto Sans",
  "Nunito",
  "Ubuntu",
  "Rubik",
  "Work Sans",
  "Fira Sans",
  "Quicksand",
  "Barlow",
  "Merriweather",
  "Playfair Display",
  "Lora",
  "PT Serif",
  "Bitter",
  "Crimson Text",
  "Inconsolata",
  "Josefin Sans",
  "Oxygen",
  "Dosis",
  "Cabin",
  "Anton",
  "Cairo",
  "Hind",
  "Dancing Script",
  "Pacifico",
  "Arial",
  "Helvetica",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Impact",
  "Arial Black",
  "Times New Roman",
  "Times",
  "Georgia",
  "Garamond",
  "Palatino",
  "Baskerville",
  "Courier New",
  "Courier",
  "Monaco",
  "Consolas",
  "Lucida Console",
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
];

export function Toolbar({
  editor,
  onImageUpload,
  onFileUpload,
  onSignature,
  setIsFindReplaceOpen,
  setIsShortcutsOpen,
  isAskAiOpen,
  setIsAskAiOpen,
  isLinkPopoverOpen,
  setIsLinkPopoverOpen,
  isSourceMode,
  setIsSourceMode,
  isPreviewOpen,
  setIsPreviewOpen,
  isSimple = false,
  tocItems,
  onTocNavigate,
  onInlineAiAction,
}: ToolbarProps) {
  // Local state for link input in popover
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);

  const [isYoutubeOpen, setIsYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [isEquationDialogOpen, setIsEquationDialogOpen] = useState(false);
  const [isChartDialogOpen, setIsChartDialogOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [fontSearch, setFontSearch] = useState("");

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
        <>
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
        </>
        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-12 px-2"
                onMouseDown={(e) => e.preventDefault()}
                aria-label="Text Type"
              >
                {getCurrentHeading() === "paragraph" && (
                  <Pilcrow className="h-4 w-4" />
                )}
                {getCurrentHeading() === "h1" && (
                  <Heading1 className="h-4 w-4" />
                )}
                {getCurrentHeading() === "h2" && (
                  <Heading2 className="h-4 w-4" />
                )}
                {getCurrentHeading() === "h3" && (
                  <Heading3 className="h-4 w-4" />
                )}
                {getCurrentHeading() === "h4" && (
                  <Heading4 className="h-4 w-4" />
                )}
                {getCurrentHeading() === "h5" && (
                  <Heading5 className="h-4 w-4" />
                )}
                {getCurrentHeading() === "h6" && (
                  <Heading6 className="h-4 w-4" />
                )}
                <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              align="start"
              className="w-45"
            >
              <DropdownMenuItem
                onClick={() => handleHeadingChange("paragraph")}
                className={getCurrentHeading() === "paragraph" ? "bg-accent" : ""}
              >
                <Pilcrow className="mr-2 h-4 w-4" />
                <span>Normal</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleHeadingChange("h1")}
                className={getCurrentHeading() === "h1" ? "bg-accent" : ""}
              >
                <Heading1 className="mr-2 h-4 w-4" />
                <span>Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleHeadingChange("h2")}
                className={getCurrentHeading() === "h2" ? "bg-accent" : ""}
              >
                <Heading2 className="mr-2 h-4 w-4" />
                <span>Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleHeadingChange("h3")}
                className={getCurrentHeading() === "h3" ? "bg-accent" : ""}
              >
                <Heading3 className="mr-2 h-4 w-4" />
                <span>Heading 3</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleHeadingChange("h4")}
                className={getCurrentHeading() === "h4" ? "bg-accent" : ""}
              >
                <Heading4 className="mr-2 h-4 w-4" />
                <span>Heading 4</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleHeadingChange("h5")}
                className={getCurrentHeading() === "h5" ? "bg-accent" : ""}
              >
                <Heading5 className="mr-2 h-4 w-4" />
                <span>Heading 5</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleHeadingChange("h6")}
                className={getCurrentHeading() === "h6" ? "bg-accent" : ""}
              >
                <Heading6 className="mr-2 h-4 w-4" />
                <span>Heading 6</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Font Family Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 w-30 justify-between ml-1 text-xs border border-input bg-transparent"
                onMouseDown={(e) => e.preventDefault()}
                aria-label="Font Family"
              >
                <span className="truncate">
                  {editor.getAttributes("textStyle").fontFamily || "DM Sans"}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              align="start"
              className="w-50 p-1"
            >
              <div className="flex items-center border-b border-border px-2 pb-1 mb-1">
                <Search className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                <input
                  placeholder="Search fonts..."
                  className="w-full bg-transparent outline-none text-sm h-8"
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                {fontSearch && (
                  <button
                    onClick={() => setFontSearch("")}
                    className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="max-h-62.5 overflow-y-auto">
                {FONTS.filter((font) =>
                  font.toLowerCase().includes(fontSearch.toLowerCase()),
                ).map((font) => (
                  <DropdownMenuItem
                    key={font}
                    onClick={() =>
                      editor.chain().focus().setFontFamily(font).run()
                    }
                    className={cn(
                      "flex items-center justify-between",
                      editor.isActive("textStyle", { fontFamily: font })
                        ? "bg-accent"
                        : "",
                    )}
                  >
                    <span className="truncate max-w-32.5">{font}</span>
                    {editor.isActive("textStyle", { fontFamily: font }) && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
              <PopoverContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="w-52 p-3"
                align="start"
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
              <PopoverContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="w-52 p-3"
                align="start"
              >
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
        </>
        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* 
          --------------------------------------------------------
          2. BASIC FORMATTING
          --------------------------------------------------------
        */}
        <>
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
            <DropdownMenuContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              align="start"
            >
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? "bg-accent" : ""}
              >
                <Underline className="mr-2 h-4 w-4" />
                <span>Underline</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "bg-accent" : ""}
              >
                <Strikethrough className="mr-2 h-4 w-4" />
                <span>Strikethrough</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={editor.isActive("code") ? "bg-accent" : ""}
              >
                <Code className="mr-2 h-4 w-4" />
                <span>Inline Code</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={editor.isActive("subscript") ? "bg-accent" : ""}
              >
                <Subscript className="mr-2 h-4 w-4" />
                <span>Subscript (Ctrl+,)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={editor.isActive("superscript") ? "bg-accent" : ""}
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
        </>
        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* 
          --------------------------------------------------------
          3. ALIGNMENT
          --------------------------------------------------------
        */}
        <>
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
            <DropdownMenuContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              align="start"
            >
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className={editor.isActive({ textAlign: "left" }) || (!editor.isActive({ textAlign: "center" }) && !editor.isActive({ textAlign: "right" }) && !editor.isActive({ textAlign: "justify" })) ? "bg-accent" : ""}
              >
                <AlignLeft className="mr-2 h-4 w-4" />
                <span>Left</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                className={editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""}
              >
                <AlignCenter className="mr-2 h-4 w-4" />
                <span>Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className={editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}
              >
                <AlignRight className="mr-2 h-4 w-4" />
                <span>Right</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                className={editor.isActive({ textAlign: "justify" }) ? "bg-accent" : ""}
              >
                <AlignJustify className="mr-2 h-4 w-4" />
                <span>Justify Align</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MoveVertical className="mr-2 h-4 w-4" />
                  <span>Line Height</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {["1", "1.15", "1.5", "2", "2.5", "3"].map((height) => (
                    <DropdownMenuItem
                      key={height}
                      onClick={() =>
                        editor.chain().focus().setLineHeight(height).run()
                      }
                      className={
                        editor.isActive({ lineHeight: height })
                          ? "bg-accent"
                          : ""
                      }
                    >
                      <span className="ml-6">{height}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* 
          --------------------------------------------------------
          4. LISTS
          --------------------------------------------------------
        */}
        <>
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
            <DropdownMenuContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              align="start"
            >
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "bg-accent" : ""}
              >
                <List className="mr-2 h-4 w-4" />
                <span>Bullet List</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "bg-accent" : ""}
              >
                <ListOrdered className="mr-2 h-4 w-4" />
                <span>Numbered List</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={editor.isActive("taskList") ? "bg-accent" : ""}
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
        </>
        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* 
          --------------------------------------------------------
          5. INSERT & MEDIA
          --------------------------------------------------------
        */}
        {!isSimple && (
          <>
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
              <PopoverContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="w-60 p-2"
                align="start"
              >
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

            <Popover
              open={isEmojiPickerOpen}
              onOpenChange={setIsEmojiPickerOpen}
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
                        isEmojiPickerOpen && "bg-accent text-accent-foreground",
                      )}
                      aria-label="Insert Emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="px-2 py-1.5 text-xs">
                  Insert Emoji
                </TooltipContent>
              </Tooltip>
              <PopoverContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="w-auto p-0 border-none bg-transparent shadow-none [&_.epr-emoji-category-label]:text-xs [&_.epr-emoji-category-label]:font-medium"
                align="center"
              >
                <EmojiPicker
                  theme={Theme.DARK}
                  onEmojiClick={(emojiData) => {
                    editor.chain().focus().insertContent(emojiData.emoji).run();
                    setIsEmojiPickerOpen(false);
                  }}
                  style={
                    {
                      "--epr-bg-color": "var(--popover)",
                      "--epr-category-label-bg-color": "var(--popover)",
                      "--epr-picker-border-color": "var(--border)",
                      "--epr-search-border-color": "var(--border)",
                      "--epr-search-input-bg-color": "transparent",
                      "--epr-highlight-color": "var(--ring)",
                      "--epr-text-color": "var(--foreground)",
                      "--epr-search-input-text-color": "var(--foreground)",
                    } as React.CSSProperties
                  }
                />
              </PopoverContent>
            </Popover>

            <ToolbarButton
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({
                    rows: 3,
                    cols: 3,
                    withHeaderRow: true,
                  })
                  .run()
              }
              title="Add Table"
            >
              <Table className="h-4 w-4" aria-label="Table" />
            </ToolbarButton>
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
              <DialogContent className="sm:max-w-106.5">
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
              <DropdownMenuContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                align="start"
              >
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
                      className={editor.isActive("blockquote") ? "bg-accent" : ""}
                    >
                      <Quote className="mr-2 h-4 w-4" />
                      <span>Blockquote</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                      }
                      className={editor.isActive("codeBlock") ? "bg-accent" : ""}
                    >
                      <FileCode className="mr-2 h-4 w-4" />
                      <span>Code Block</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsEquationDialogOpen(true)}
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
                        editor.chain().focus().setButtonBlock().run()
                      }
                    >
                      <MousePointerClick className="mr-2 h-4 w-4" />
                      <span>Button</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsChartDialogOpen(true)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Chart</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().setLayout({ cols: 2 }).run()
                      }
                    >
                      <Columns className="mr-2 h-4 w-4" />
                      <span>2 Columns</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        editor.chain().focus().setLayout({ cols: 3 }).run()
                      }
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
                        editor
                          .chain()
                          .focus()
                          .insertContent(FAQ_PATTERN_CONTENT)
                          .run()
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
          </>
        )}
        {!isSimple && <div className="w-px h-5 bg-border mx-1 shrink-0" />}

        {/* 
          --------------------------------------------------------
          6. TOOLS & UTILITIES
          --------------------------------------------------------
        */}
        {!isSimple && (
          <>
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
              <PopoverContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="w-64 p-2"
                align="start"
              >
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
              onClick={() => setIsPreviewOpen(true)}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setIsSourceMode(!isSourceMode)}
              active={isSourceMode}
              title="Source Code"
            >
              <CodeXml className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-border mx-1" />
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-2 gap-1 ml-1 text-xs font-medium",
                        isAskAiOpen && "bg-accent text-accent-foreground",
                      )}
                      aria-label="AI Actions"
                    >
                      <AIIcon className="h-3 w-3" />
                      <span>AI</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
              <DropdownMenuContent
                onCloseAutoFocus={(e) => e.preventDefault()}
                align="start"
                className="w-56 p-1.5"
              >
                <DropdownMenuItem
                  onClick={() => setIsAskAiOpen(!isAskAiOpen)}
                  className="cursor-pointer font-medium mb-1"
                >
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  <span>AI Chat</span>
                </DropdownMenuItem>

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

                <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Generate
                </div>
                <DropdownMenuItem
                  onClick={() => onInlineAiAction?.("generate_image")}
                  className="cursor-pointer"
                >
                  <ImagePlus className="mr-2 h-4 w-4 opacity-70" />
                  <span>Generate Image</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      <EquationEditDialog
        isOpen={isEquationDialogOpen}
        latex=""
        displayMode={true}
        onClose={() => setIsEquationDialogOpen(false)}
        onSave={(latex, displayMode) => {
          setIsEquationDialogOpen(false);
          setTimeout(() => {
            editor.chain().focus().setEquation({ latex, displayMode }).run();
          }, 10);
        }}
      />

      <EditChartDialog
        isOpen={isChartDialogOpen}
        chartType="bar"
        title="Chart Title"
        dataPoints={DEFAULT_CHART_POINTS}
        onClose={() => setIsChartDialogOpen(false)}
        onSave={(attrs) => {
          setIsChartDialogOpen(false);
          setTimeout(() => {
            editor.chain().focus().setChartBlock(attrs).run();
          }, 10);
        }}
      />
    </TooltipProvider>
  );
}
