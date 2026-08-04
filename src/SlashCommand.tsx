import { Extension } from "@tiptap/core";
import { Editor, ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import {
  CheckSquare,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Table as TableIcon,
} from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FaYoutube } from "react-icons/fa";

import { cn } from "./lib/utils";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (props: { editor: Editor; range: { from: number; to: number } }) => void;
}

export interface SlashCommandOptions {
  onImageCommand?: () => void;
  onYoutubeCommand?: () => void;
}

function getSlashCommandItems({ onImageCommand, onYoutubeCommand }: SlashCommandOptions): SlashCommandItem[] {
  const items: SlashCommandItem[] = [
    {
      title: "Text",
      description: "Plain paragraph",
      icon: Pilcrow,
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      title: "Heading 1",
      description: "Large section heading",
      icon: Heading1,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: Heading3,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
    },
    {
      title: "Bullet List",
      description: "Unordered list",
      icon: List,
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      description: "Ordered list",
      icon: ListOrdered,
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "Task List",
      description: "Checkbox to-do list",
      icon: CheckSquare,
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      title: "Blockquote",
      description: "Quoted text block",
      icon: Quote,
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Code Block",
      description: "Multi-line code block",
      icon: FileCode,
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "Table",
      description: "3x3 table with header row",
      icon: TableIcon,
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: "Horizontal Rule",
      description: "Divider line",
      icon: Minus,
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
  ];

  if (onImageCommand) {
    items.push({
      title: "Image",
      description: "Upload or embed an image",
      icon: ImagePlus,
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
      icon: FaYoutube,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        onYoutubeCommand();
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

const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="w-64 rounded-md border border-border bg-popover p-3 text-sm text-muted-foreground shadow-md">
        No results
      </div>
    );
  }

  return (
    <div className="w-64 max-h-80 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
      {items.map((item, index) => (
        <button
          type="button"
          key={item.title}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={cn(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
            index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex flex-col">
            <span className="font-medium leading-tight">{item.title}</span>
            <span className="text-xs text-muted-foreground leading-tight">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});
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
          let renderer: ReactRenderer<SlashCommandListRef, SlashCommandListProps> | null = null;
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
              renderer?.updateProps({ items: props.items, command: props.command });
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
