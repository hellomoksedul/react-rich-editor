import { Extension } from "@tiptap/core";
import { Editor, ReactRenderer } from "@tiptap/react";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";
import {
  BarChart3,
  CheckSquare,
  Columns,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  HelpCircle,
  ImagePlus,
  List,
  ListOrdered,
  Minus,
  MousePointerClick,
  Paperclip,
  PenTool,
  Pilcrow,
  Quote,
  Sigma,
  Table as TableIcon,
} from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FiYoutube } from "react-icons/fi";

import { cn } from "./lib/utils";

/** Groups items in the slash menu, mirroring the toolbar's "Insert Items"
 * categories so both menus present the same mental model. */
export type SlashCommandCategory = "editorial" | "blocks" | "patterns";

const CATEGORY_LABELS: Record<SlashCommandCategory, string> = {
  editorial: "Editorial",
  blocks: "Blocks",
  patterns: "Patterns",
};

const CATEGORY_ORDER: SlashCommandCategory[] = [
  "editorial",
  "blocks",
  "patterns",
];

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: SlashCommandCategory;
  command: (props: {
    editor: Editor;
    range: { from: number; to: number };
  }) => void;
}

export interface SlashCommandOptions {
  onImageCommand?: () => void;
  onYoutubeCommand?: () => void;
  onFileCommand?: () => void;
  onSignatureCommand?: () => void;
}

/**
 * The "FAQ" pattern: a canned insertion built entirely from existing node
 * types (heading + paragraph) rather than a new schema — a question/answer
 * accordion (collapsible via <details>) is a plausible v2 if this turns out
 * to need real collapse/expand behavior, but a flat editable outline covers
 * the common case with far less risk.
 */
export const FAQ_PATTERN_CONTENT = [
  {
    type: "heading",
    attrs: { level: 3 },
    content: [{ type: "text", text: "Frequently Asked Questions" }],
  },
  {
    type: "heading",
    attrs: { level: 4 },
    content: [{ type: "text", text: "Question one?" }],
  },
  { type: "paragraph", content: [{ type: "text", text: "Answer goes here." }] },
  {
    type: "heading",
    attrs: { level: 4 },
    content: [{ type: "text", text: "Question two?" }],
  },
  { type: "paragraph", content: [{ type: "text", text: "Answer goes here." }] },
  {
    type: "heading",
    attrs: { level: 4 },
    content: [{ type: "text", text: "Question three?" }],
  },
  { type: "paragraph", content: [{ type: "text", text: "Answer goes here." }] },
];

function getSlashCommandItems({
  onImageCommand,
  onYoutubeCommand,
  onFileCommand,
  onSignatureCommand,
}: SlashCommandOptions): SlashCommandItem[] {
  const items: SlashCommandItem[] = [
    {
      title: "Text",
      description: "Plain paragraph",
      icon: Pilcrow,
      category: "editorial",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      title: "Heading 1",
      description: "Large section heading",
      icon: Heading1,
      category: "editorial",
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run(),
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      category: "editorial",
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run(),
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: Heading3,
      category: "editorial",
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run(),
    },
    {
      title: "Bullet List",
      description: "Unordered list",
      icon: List,
      category: "editorial",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      description: "Ordered list",
      icon: ListOrdered,
      category: "editorial",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "Task List",
      description: "Checkbox to-do list",
      icon: CheckSquare,
      category: "editorial",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      title: "Blockquote",
      description: "Quoted text block",
      icon: Quote,
      category: "editorial",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Code Block",
      description: "Multi-line code block",
      icon: FileCode,
      category: "editorial",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "Equation",
      description: "LaTeX math, rendered with KaTeX",
      icon: Sigma,
      category: "editorial",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setEquation().run(),
    },
    {
      title: "Table",
      description: "3x3 table with header row",
      icon: TableIcon,
      category: "blocks",
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      title: "Horizontal Rule",
      description: "Divider line",
      icon: Minus,
      category: "blocks",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      title: "Button",
      description: "Call-to-action button",
      icon: MousePointerClick,
      category: "blocks",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setButtonBlock().run(),
    },
    {
      title: "Chart",
      description: "Bar, line, pie or donut chart",
      icon: BarChart3,
      category: "blocks",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setChartBlock().run(),
    },
    {
      title: "2 Columns",
      description: "Side-by-side layout",
      icon: Columns,
      category: "blocks",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setLayout({ cols: 2 }).run(),
    },
    {
      title: "3 Columns",
      description: "Three-column layout",
      icon: Columns,
      category: "blocks",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setLayout({ cols: 3 }).run(),
    },
    {
      title: "FAQ",
      description: "Question & answer outline",
      icon: HelpCircle,
      category: "patterns",
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent(FAQ_PATTERN_CONTENT)
          .run(),
    },
  ];

  if (onImageCommand) {
    items.push({
      title: "Image",
      description: "Upload or embed an image",
      icon: ImagePlus,
      category: "blocks",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        onImageCommand();
      },
    });
  }

  if (onYoutubeCommand) {
    items.push({
      title: "YouTube",
      description: "Embed a YouTube video",
      icon: FiYoutube,
      category: "blocks",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        onYoutubeCommand();
      },
    });
  }

  if (onFileCommand) {
    items.push({
      title: "Upload File",
      description: "Attach a downloadable file",
      icon: Paperclip,
      category: "blocks",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        onFileCommand();
      },
    });
  }

  if (onSignatureCommand) {
    items.push({
      title: "Signature",
      description: "Draw and insert a signature",
      icon: PenTool,
      category: "blocks",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        onSignatureCommand();
      },
    });
  }

  return items;
}

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashCommandListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Group by category (Editorial / Blocks / Patterns) for display, but keep a
    // single flat list around for keyboard navigation + selection indexing.
    const groups = CATEGORY_ORDER.map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0);
    const flatItems = groups.flatMap((group) => group.items);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const item = flatItems[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (flatItems.length === 0) return false;
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (prev) => (prev + flatItems.length - 1) % flatItems.length,
          );
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % flatItems.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (flatItems.length === 0) {
      return (
        <div className="w-64 rounded-md border border-border bg-popover p-3 text-sm text-muted-foreground shadow-md hellokit-editor-scope">
          No results
        </div>
      );
    }

    return (
      <div className="w-64 max-h-80 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md hellokit-scrollbar hellokit-editor-scope">
        {groups.map((group) => (
          <div key={group.category}>
            <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 first:pt-1">
              {CATEGORY_LABELS[group.category]}
            </div>
            {group.items.map((item) => {
              const index = flatItems.indexOf(item);
              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => selectItem(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col">
                    <span className="font-medium leading-tight">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
);
SlashCommandList.displayName = "SlashCommandList";

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      onImageCommand: undefined,
      onYoutubeCommand: undefined,
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        items: ({ query }) =>
          getSlashCommandItems(options).filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()),
          ),
        command: ({ editor, range, props }) => {
          (props as SlashCommandItem).command({ editor, range });
        },
        render: () => {
          let renderer: ReactRenderer<
            SlashCommandListRef,
            SlashCommandListProps
          > | null = null;
          let unmount: (() => void) | null = null;

          return {
            onStart: (props: SuggestionProps<SlashCommandItem>) => {
              renderer = new ReactRenderer(SlashCommandList, {
                props: { items: props.items, command: props.command },
                editor: props.editor,
              });
              unmount = props.mount(renderer.element as HTMLElement);
            },
            onUpdate(props: SuggestionProps<SlashCommandItem>) {
              renderer?.updateProps({
                items: props.items,
                command: props.command,
              });
            },
            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === "Escape") {
                unmount?.();
                return true;
              }
              return renderer?.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              unmount?.();
              renderer?.destroy();
              renderer = null;
              unmount = null;
            },
          };
        },
      }),
    ];
  },
});
