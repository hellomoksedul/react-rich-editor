"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import katex from "katex";
import { Sigma } from "lucide-react";
import { useMemo, useState } from "react";
import { EquationEditDialog } from "./EquationEditDialog";
import { cn } from "./lib/utils";

export interface EquationOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    equation: {
      /** Insert a new Equation block (optionally pre-filled with LaTeX). */
      setEquation: (attrs?: {
        latex?: string;
        displayMode?: boolean;
      }) => ReturnType;
    };
  }
}

function renderLatex(
  latex: string,
  displayMode: boolean,
): { html: string; error: boolean } {
  if (!latex.trim()) return { html: "", error: false };
  try {
    return {
      html: katex.renderToString(latex, { displayMode, throwOnError: false }),
      error: false,
    };
  } catch {
    return { html: "", error: true };
  }
}

function EquationView({
  node,
  updateAttributes,
  selected,
  editor,
}: NodeViewProps) {
  const { latex, displayMode } = node.attrs as {
    latex: string;
    displayMode: boolean;
  };
  const [isEditing, setIsEditing] = useState(false);
  const { html, error } = useMemo(
    () => renderLatex(latex, displayMode),
    [latex, displayMode],
  );

  const openEditor = () => {
    if (!editor.isEditable) return;
    setIsEditing(true);
  };

  return (
    <NodeViewWrapper
      as="span"
      data-equation-wrapper=""
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent/40 rounded-sm",
        displayMode
          ? "my-2 flex justify-center p-2"
          : "px-1 mx-0.5 inline-flex items-center align-middle",
        selected && "ring-2 ring-primary",
      )}
      onClick={openEditor}
    >
      {!latex.trim() ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Sigma className="h-4 w-4" />
          Click to add an equation
        </div>
      ) : error ? (
        <span className="text-sm text-destructive py-1">Invalid LaTeX</span>
      ) : (
        // KaTeX renders to a static HTML/MathML string; there's no ProseMirror
        // content to model here, so this is injected directly (same tradeoff
        // Mermaid/KaTeX-in-Tiptap examples make elsewhere).
        <span
          dangerouslySetInnerHTML={{ __html: html }}
          className={cn(
            displayMode ? "" : "inline-block align-middle leading-none",
          )}
        />
      )}

      <EquationEditDialog
        isOpen={isEditing}
        latex={latex}
        displayMode={displayMode}
        onClose={() => setIsEditing(false)}
        onSave={(newLatex, newDisplayMode) => {
          updateAttributes({ latex: newLatex, displayMode: newDisplayMode });
          setIsEditing(false);
        }}
      />
    </NodeViewWrapper>
  );
}

/**
 * A LaTeX equation block, rendered via KaTeX. Requires consumers to also
 * import KaTeX's stylesheet once in their app (`import "katex/dist/katex.min.css"`)
 * — see the package README. Saved/exported HTML (`editor.getHTML()`) stores
 * the raw LaTeX in a `<code>` fallback rather than pre-rendered markup, since
 * re-rendering it requires KaTeX to be present wherever it's displayed.
 */
export const Equation = Node.create<EquationOptions>({
  name: "equation",
  group: "inline",
  inline: true,
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("data-latex") || element.textContent || "",
        renderHTML: (attributes) => ({ "data-latex": attributes.latex }),
      },
      displayMode: {
        default: true,
        parseHTML: (element) =>
          element.getAttribute("data-display-mode") !== "false",
        renderHTML: (attributes) => ({
          "data-display-mode": String(attributes.displayMode),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-equation-wrapper]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-equation-wrapper": "",
      }),
      ["code", {}, node.attrs.latex || ""],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EquationView);
  },

  addCommands() {
    return {
      setEquation:
        (attrs = {}) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                latex: attrs.latex ?? "",
                displayMode: attrs.displayMode ?? true,
              },
            })
            .run();
        },
    };
  },
});
