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
import { LayoutItem, LayoutGroup } from "./LayoutExtension";
import { Equation } from "./EquationExtension";
import { FileAttachment } from "./FileAttachmentExtension";
import { FontSize } from "./FontSizeExtension";
import { FontWeight } from "./FontWeightExtension";
import { ResizableImage } from "./ResizableImage";
import { ResizableYoutube } from "./ResizableYoutube";
import { SlashCommand, type SlashCommandOptions } from "./SlashCommand";

/** One entry in the table of contents, as reported by the TableOfContents
 * extension's onUpdate callback. Re-exported so consumers (e.g. Toolbar)
 * don't need to depend on @tiptap/extension-table-of-contents directly. */
export type TocItem = TableOfContentDataItem;

export type GetEditorExtensionsOptions = SlashCommandOptions & {
  /**
   * Fires whenever the document's heading structure changes, with the
   * current flat list of headings (id, level, textContent, pos, ...). Used
   * to power a "Table of Contents" navigation UI. Omit if you don't need one.
   */
  onTocUpdate?: (items: TocItem[]) => void;
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
  Table.configure({
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
  Image.extend({
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
  Color,
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
  ButtonBlock,
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
