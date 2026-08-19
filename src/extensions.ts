import type { Extensions } from "@tiptap/core";
import CharacterCount from "@tiptap/extension-character-count";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  getHierarchicalIndexes,
  TableOfContents,
  type TableOfContentDataItem,
} from "@tiptap/extension-table-of-contents";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";

import { ReactNodeViewRenderer } from "@tiptap/react";
import { ButtonBlock } from "./ButtonBlockExtension";
import { ChartBlock } from "./ChartBlockExtension";
import { CustomCodeBlock } from "./CodeBlockExtension";
import { Equation } from "./EquationExtension";
import { FileAttachment } from "./FileAttachmentExtension";
import { FontSize } from "./FontSizeExtension";
import { FontWeight } from "./FontWeightExtension";
import { LineHeight } from "./LineHeightExtension";
import { FontFamily } from "./FontFamilyExtension";
import { LayoutGroup, LayoutItem } from "./LayoutExtension";
import { ResizableImage } from "./ResizableImage";
import { ResizableYoutube } from "./ResizableYoutube";
import { SlashCommand, type SlashCommandOptions } from "./SlashCommand";

/** One entry in the table of contents, as reported by the TableOfContents
 * extension's onUpdate callback. Re-exported so consumers (e.g. Toolbar)
 * don't need to depend on @tiptap/extension-table-of-contents directly. */
export type TocItem = TableOfContentDataItem;

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const AiLoadingExtension = Extension.create({
  name: "aiLoading",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("aiLoading"),
        state: {
          init() {
            return { isLoading: false, from: 0, to: 0 };
          },
          apply(tr, value) {
            const meta = tr.getMeta("aiLoading");
            if (meta !== undefined) {
              return meta;
            }
            if (value.isLoading) {
              return {
                isLoading: true,
                from: tr.mapping.map(value.from),
                to: tr.mapping.map(value.to),
              };
            }
            return value;
          },
        },
        props: {
          decorations(state) {
            const pluginState = this.getState(state);
            if (!pluginState) return DecorationSet.empty;
            const { isLoading, from, to } = pluginState;
            if (!isLoading || from === to) return DecorationSet.empty;
            
            const deco = Decoration.inline(from, to, {
              class: "animate-pulse text-muted-foreground bg-muted rounded px-1",
            });
            return DecorationSet.create(state.doc, [deco]);
          },
        },
      }),
    ];
  },
});

export type GetEditorExtensionsOptions = SlashCommandOptions & {
  /**
   * Fires whenever the document's heading structure changes, with the
   * current flat list of headings (id, level, textContent, pos, ...). Used
   * to power a "Table of Contents" navigation UI. Omit if you don't need one.
   */
  onTocUpdate?: (items: TocItem[]) => void;
  onGenerateImage?: (prompt: string, options?: { aspectRatio?: string }) => Promise<string>;
  onImageUpload?: (file: File) => Promise<string>;
};

export const getEditorExtensions = (
  placeholder = "Start writing...",
  options: GetEditorExtensionsOptions = {},
): Extensions => [
  StarterKit.configure({
    // Configured separately below (custom title attribute / node view), so
    // disable StarterKit's bundled defaults to avoid duplicate registration.
    link: false,
    underline: false,
    codeBlock: false,
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Underline,
  Subscript,
  Superscript,
  Typography,
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Table.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        fullWidth: {
          default: true,
          parseHTML: (element) =>
            element.getAttribute("data-full-width") !== "false",
          renderHTML: (attributes) => {
            return {
              "data-full-width": attributes.fullWidth ? "true" : "false",
            };
          },
        },
      };
    },
    addNodeView() {
      const parentNodeView = this.parent?.();
      if (!parentNodeView) return null;

      return (props) => {
        // Tiptap's default TableView ignores renderHTML, so we must manually patch the DOM.
        const view = parentNodeView(props) as any;
        if (view && view.dom) {
          const table =
            view.table || view.dom.querySelector("table") || view.dom;

          const updateAttrs = (node: any) => {
            const isFull = node.attrs.fullWidth !== false;
            table.setAttribute("data-full-width", isFull ? "true" : "false");
          };

          updateAttrs(props.node);

          if (view.update) {
            const oldUpdate = view.update.bind(view);
            view.update = (node: any) => {
              updateAttrs(node);
              return oldUpdate(node);
            };
          }
        }
        return view;
      };
    },
  }).configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        backgroundColor: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-background-color"),
          renderHTML: (attributes) => {
            if (!attributes.backgroundColor) {
              return {};
            }
            return {
              "data-background-color": attributes.backgroundColor,
              style: `background-color: ${attributes.backgroundColor}`,
            };
          },
        },
      };
    },
  }),
  Image.extend<any>({
    addOptions() {
      return {
        ...this.parent?.(),
        onGenerateImage: undefined,
        onImageUpload: undefined,
      };
    },
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
        },
        height: {
          default: null,
        },
        align: {
          default: "center",
        },
        fullWidth: {
          default: true,
        },
        display: {
          default: "inline",
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(ResizableImage);
    },
  }).configure({
    inline: true,
    allowBase64: true,
    onGenerateImage: options.onGenerateImage,
    onImageUpload: options.onImageUpload,
  }),
  Link.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        title: {
          default: null,
          parseHTML: (element) => element.getAttribute("title"),
          renderHTML: (attributes) => {
            if (!attributes.title) {
              return {};
            }
            return {
              title: attributes.title,
            };
          },
        },
      };
    },
  }).configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-primary underline",
    },
  }),
  Placeholder.configure({
    placeholder,
  }),
  TextStyle,
  FontSize,
  FontWeight,
  FontFamily,
  Color,
  LineHeight,
  Highlight.configure({
    multicolor: true,
  }),
  CharacterCount,
  TableOfContents.configure({
    getIndex: getHierarchicalIndexes,
    onUpdate: (items) => options.onTocUpdate?.(items),
  }),
  Youtube.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: 640,
        },
        height: {
          default: 480,
        },
        align: {
          default: "left",
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(ResizableYoutube);
    },
  }).configure({
    controls: false,
    nocookie: true,
  }),
  AiLoadingExtension,
  ButtonBlock,
  CustomCodeBlock,
  ChartBlock,
  LayoutGroup,
  LayoutItem,
  Equation,
  FileAttachment,
  SlashCommand.configure({
    onImageCommand: options.onImageCommand,
    onYoutubeCommand: options.onYoutubeCommand,
    onFileCommand: options.onFileCommand,
    onSignatureCommand: options.onSignatureCommand,
  }),
];
