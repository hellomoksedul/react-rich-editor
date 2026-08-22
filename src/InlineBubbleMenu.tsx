"use client";

import { Editor } from "@tiptap/react";
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
  Trash2,
  Underline,
  Unlink,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AIIcon } from "./AIIcon";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

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

const ICON_COLORS = [
  { name: "Default", value: "currentColor", bg: "bg-foreground" },
  { name: "Slate", value: "#64748b", bg: "bg-slate-500" },
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Emerald", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Rose", value: "#f43f5e", bg: "bg-rose-500" },
  { name: "Amber", value: "#f59e0b", bg: "bg-amber-500" },
  { name: "Purple", value: "#a855f7", bg: "bg-purple-500" },
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

  const [menuPosition, setMenuPosition] = useState<{
    show: boolean;
    top: number;
    left: number;
  }>({ show: false, top: 0, left: 0 });

  const menuRef = useRef<HTMLDivElement>(null);

  // Sync link url when popover opens
  useEffect(() => {
    if (isLinkOpen && editor) {
      const previousUrl = editor.getAttributes("link").href;
      const previousTitle = editor.getAttributes("link").title;
      setLinkUrl(previousUrl || "");
      setLinkTitle(previousTitle || "");
    }
  }, [isLinkOpen, editor]);

  // Position calculation and boundary clamping
  useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      if (!editor.isEditable) {
        setMenuPosition((s) => (s.show ? { ...s, show: false } : s));
        return;
      }

      // If any popover is currently open, keep the menu visible in place
      if (isLinkOpen || isColorOpen || isHighlightOpen || isAskAiOpen) {
        return;
      }

      const { selection } = editor.state;
      const isEmpty = selection.empty;
      const isTable = editor.isActive("table");
      const isImage = editor.isActive("image");
      const isYoutube = editor.isActive("youtube");
      const isChart = editor.isActive("chartBlock");
      const isButton = editor.isActive("buttonBlock");
      const isIcon = editor.isActive("iconNode");

      if (
        (isEmpty && !isIcon) ||
        isTable ||
        isImage ||
        isYoutube ||
        isChart ||
        isButton
      ) {
        setMenuPosition((s) => (s.show ? { ...s, show: false } : s));
        return;
      }

      let targetRect: DOMRect | null = null;

      if (isIcon) {
        // Find the selected icon DOM element
        const domSelection = window.getSelection();
        const activeEl = document.querySelector(
          ".hellokit-icon-wrapper.ProseMirror-selectednode, [data-icon-node].ProseMirror-selectednode, [data-icon-node] .ring-primary",
        );
        if (activeEl) {
          targetRect = activeEl.getBoundingClientRect();
        } else if (domSelection && domSelection.rangeCount > 0) {
          targetRect = domSelection.getRangeAt(0).getBoundingClientRect();
        }
      } else {
        const domSelection = window.getSelection();
        if (
          !domSelection ||
          domSelection.rangeCount === 0 ||
          domSelection.isCollapsed
        ) {
          setMenuPosition((s) => (s.show ? { ...s, show: false } : s));
          return;
        }
        targetRect = domSelection.getRangeAt(0).getBoundingClientRect();
      }

      if (!targetRect || (targetRect.width === 0 && targetRect.height === 0)) {
        setMenuPosition((s) => (s.show ? { ...s, show: false } : s));
        return;
      }

      // Find the editor container
      const editorDom = editor.view.dom;
      const editorContainer =
        editorDom.closest(".hellokit-editor-container") ||
        editorDom.parentElement ||
        document.body;

      const containerRect = editorContainer.getBoundingClientRect();

      // Measure menu width
      const menuWidth = menuRef.current?.offsetWidth || (isIcon ? 300 : 380);
      const menuHeight = menuRef.current?.offsetHeight || 44;
      const padding = 10;

      // Desired center on the selection/node
      const selectionCenter = targetRect.left + targetRect.width / 2;
      let idealLeft = selectionCenter - menuWidth / 2;

      // Auto-align based on container boundaries:
      const minLeft = containerRect.left + padding;
      const maxLeft = containerRect.right - menuWidth - padding;

      const screenMinLeft = padding;
      const screenMaxLeft = window.innerWidth - menuWidth - padding;

      const effectiveMinLeft = Math.max(minLeft, screenMinLeft);
      const effectiveMaxLeft = Math.min(maxLeft, screenMaxLeft);

      let clampedLeft = idealLeft;
      if (effectiveMaxLeft >= effectiveMinLeft) {
        clampedLeft = Math.max(
          effectiveMinLeft,
          Math.min(effectiveMaxLeft, idealLeft),
        );
      }

      // Determine top placement (flip below if no room above)
      const topBoundary = containerRect.top + 44; // Below toolbar area
      const isSpaceAbove = targetRect.top - menuHeight - 8 >= topBoundary;

      let calculatedTop = isSpaceAbove
        ? targetRect.top - menuHeight - 8
        : targetRect.bottom + 8;

      const minTop = Math.max(containerRect.top + padding, padding);
      const maxTop = Math.min(
        containerRect.bottom - menuHeight - padding,
        window.innerHeight - menuHeight - padding,
      );

      if (maxTop >= minTop) {
        calculatedTop = Math.max(minTop, Math.min(maxTop, calculatedTop));
      }

      setMenuPosition({
        show: true,
        top: calculatedTop,
        left: clampedLeft,
      });
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("update", updatePosition);
    editor.on("focus", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    updatePosition();

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("update", updatePosition);
      editor.off("focus", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [editor, isLinkOpen, isColorOpen, isHighlightOpen, isAskAiOpen]);

  if (!editor || !menuPosition.show) return null;

  const isIcon = editor.isActive("iconNode");
  const iconAttrs = isIcon ? editor.getAttributes("iconNode") : null;
  const currentIconSize = iconAttrs?.size || 24;
  const currentIconColor = iconAttrs?.color || "currentColor";

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        zIndex: 9999,
        pointerEvents: "auto",
      }}
      className="hellokit-editor-scope animate-in fade-in zoom-in-95 duration-150"
    >
      {isIcon ? (
        /* Unified Reusable Icon Tools Box */
        <div className="flex items-center flex-nowrap whitespace-nowrap gap-3 rounded-md border border-border bg-popover text-popover-foreground px-3 py-1.5 shadow-xl w-max min-w-70 select-none">
          {/* Editable Size Box */}
          <div className="flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-lg border border-border/50">
            <input
              type="number"
              min={12}
              max={240}
              value={currentIconSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 12 && val <= 240) {
                  editor
                    .chain()
                    .focus()
                    .updateAttributes("iconNode", { size: val })
                    .run();
                }
              }}
              className="w-8 text-xs font-mono text-center bg-transparent text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-semibold"
              title="Icon size in pixels"
            />
            <span className="text-[10px] text-muted-foreground font-mono">
              px
            </span>
          </div>

          <div className="h-4 w-px bg-border/60" />

          {/* Aesthetic Color Swatches */}
          <div className="flex items-center gap-1.5">
            {ICON_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .updateAttributes("iconNode", { color: c.value })
                    .run()
                }
                className={cn(
                  "h-4 w-4 rounded-full border transition-all cursor-pointer",
                  c.bg,
                  currentIconColor === c.value
                    ? "ring-2 ring-primary ring-offset-1 scale-115 border-white shadow-xs"
                    : "border-border/60 opacity-80 hover:opacity-100 hover:scale-110",
                )}
                title={c.name}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-border/60" />

          {/* Clean Delete Icon Button */}
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
            title="Delete Icon"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Unified Text Formatting Selection Box */
        <div className="flex items-center flex-nowrap whitespace-nowrap gap-1 rounded-xl border border-border bg-popover text-popover-foreground p-1 shadow-2xl w-max min-w-max select-none">
          {/* Bold, Italic, Underline, Strike, Code */}
          <div className="flex items-center gap-0.5 border-r border-border pr-1">
            <Button
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${
                (
                  editor.isActive("heading")
                    ? editor.getAttributes("textStyle").fontWeight !== "400"
                    : editor.isActive("bold")
                )
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
                editor.isActive("italic")
                  ? "bg-accent text-accent-foreground"
                  : ""
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
                editor.isActive("strike")
                  ? "bg-accent text-accent-foreground"
                  : ""
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
                editor.isActive("code")
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Inline Code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Text Color, Highlight */}
          <div className="flex items-center gap-0.5 border-r border-border pr-1">
            <DropdownMenu open={isColorOpen} onOpenChange={setIsColorOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Text Color"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="hellokit-editor-scope p-2 w-auto min-w-40"
              >
                <div className="grid grid-cols-4 gap-1.5 p-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-6 w-6 rounded-full border border-border/40 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setIsColorOpen(false);
                      }}
                      title={color}
                    />
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setIsColorOpen(false);
                  }}
                  className="text-xs text-muted-foreground flex items-center justify-between cursor-pointer"
                >
                  <span>Reset to Default</span>
                  <Eraser className="h-3 w-3" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu
              open={isHighlightOpen}
              onOpenChange={setIsHighlightOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("highlight")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                  title="Highlight"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="hellokit-editor-scope p-2 w-auto min-w-40"
              >
                <div className="grid grid-cols-4 gap-1.5 p-1">
                  {[
                    "#fef08a",
                    "#fed7aa",
                    "#fbcfe8",
                    "#bbf7d0",
                    "#bae6fd",
                    "#ddd6fe",
                    "#fecdd3",
                    "#e2e8f0",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-6 w-6 rounded-full border border-border/40 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run();
                        setIsHighlightOpen(false);
                      }}
                      title={color}
                    />
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setIsHighlightOpen(false);
                  }}
                  className="text-xs text-muted-foreground flex items-center justify-between cursor-pointer"
                >
                  <span>Remove Highlight</span>
                  <Eraser className="h-3 w-3" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Link Dropdown */}
          <div className="flex items-center gap-0.5 border-r border-border pr-1">
            <DropdownMenu open={isLinkOpen} onOpenChange={setIsLinkOpen}>
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
              <DropdownMenuContent
                align="start"
                className="hellokit-editor-scope w-72 p-3 space-y-2"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Text Title (Optional)
                  </label>
                  <Input
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="e.g. Documentation"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Target URL
                  </label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-8 text-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (linkUrl) {
                          editor
                            .chain()
                            .focus()
                            .extendMarkRange("link")
                            .setLink({
                              href: linkUrl,
                              title: linkTitle || undefined,
                            })
                            .run();
                          setIsLinkOpen(false);
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  {editor.isActive("link") ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        editor.chain().focus().unsetLink().run();
                        setIsLinkOpen(false);
                      }}
                    >
                      <Unlink className="h-3 w-3 mr-1" />
                      Unlink
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => {
                      if (linkUrl) {
                        editor
                          .chain()
                          .focus()
                          .extendMarkRange("link")
                          .setLink({
                            href: linkUrl,
                            title: linkTitle || undefined,
                          })
                          .run();
                        setIsLinkOpen(false);
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Ask AI Context Menu */}
          <DropdownMenu open={isAskAiOpen} onOpenChange={setIsAskAiOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                title="Ask AI"
              >
                <AIIcon className="h-3.5 w-3.5" />
                <span>AI</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="hellokit-editor-scope w-52 p-1 text-xs"
            >
              <DropdownMenuItem
                onClick={() => onInlineAiAction?.("improve")}
                className="cursor-pointer"
              >
                <Wand2 className="mr-2 h-4 w-4 opacity-70" />
                <span>Improve Writing</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onInlineAiAction?.("fix_spelling")}
                className="cursor-pointer"
              >
                <CheckCircle className="mr-2 h-4 w-4 opacity-70" />
                <span>Fix Spelling & Grammar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onInlineAiAction?.("summarize")}
                className="cursor-pointer"
              >
                <AlignLeft className="mr-2 h-4 w-4 opacity-70" />
                <span>Summarize Selection</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
      )}
    </div>
  );
}
