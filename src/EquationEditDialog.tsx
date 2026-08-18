"use client";

import katex from "katex";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { EditorDialog } from "./ui/editor-dialog";
import { Textarea } from "./ui/textarea";

export interface EquationEditDialogProps {
  isOpen: boolean;
  latex: string;
  displayMode: boolean;
  onClose: () => void;
  onSave: (latex: string, displayMode: boolean) => void;
}

const SYMBOLS: { label: string; insert: string }[] = [
  { label: "x²", insert: "x^{2}" },
  { label: "√", insert: "\\sqrt{}" },
  { label: "a/b", insert: "\\frac{}{}" },
  { label: "Σ", insert: "\\sum_{i=1}^{n}" },
  { label: "∫", insert: "\\int_{}^{}" },
  { label: "π", insert: "\\pi" },
  { label: "α", insert: "\\alpha" },
  { label: "β", insert: "\\beta" },
  { label: "θ", insert: "\\theta" },
  { label: "∞", insert: "\\infty" },
  { label: "±", insert: "\\pm" },
  { label: "≠", insert: "\\neq" },
  { label: "≤", insert: "\\leq" },
  { label: "≥", insert: "\\geq" },
  { label: "→", insert: "\\rightarrow" },
];

/** Editable LaTeX source + live KaTeX preview + a small symbol palette,
 * mirroring the reference editor's equation editor. MathML editing isn't
 * offered — KaTeX doesn't produce MathML, and it added real complexity for
 * little practical benefit here (see the advanced-features plan). */
export function EquationEditDialog({
  isOpen,
  latex,
  displayMode,
  onClose,
  onSave,
}: EquationEditDialogProps) {
  const [draft, setDraft] = useState(latex);
  const [mode, setMode] = useState(displayMode);

  useEffect(() => {
    if (isOpen) {
      setDraft(latex);
      setMode(displayMode);
    }
  }, [isOpen, latex, displayMode]);

  const { html, error } = useMemo(() => {
    if (!draft.trim()) return { html: "", error: false };
    try {
      return {
        html: katex.renderToString(draft, { displayMode: mode, throwOnError: false }),
        error: false,
      };
    } catch {
      return { html: "", error: true };
    }
  }, [draft, mode]);

  const insertSymbol = (snippet: string) => {
    setDraft((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${snippet}`);
  };

  return (
    <EditorDialog open={isOpen} onOpenChange={(open) => !open && onClose()} title="Equation">
        <div className="flex flex-wrap gap-1 rounded-md bg-muted/50 p-2">
          {SYMBOLS.map((symbol) => (
            <button
              type="button"
              key={symbol.label}
              onClick={() => insertSymbol(symbol.insert)}
              className="h-8 min-w-8 rounded-sm border border-border bg-background px-2 text-sm hover:bg-accent"
              title={symbol.insert}
            >
              {symbol.label}
            </button>
          ))}
        </div>

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. E = mc^2"
          rows={3}
          autoFocus
          className="font-mono text-sm"
        />

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={mode} onChange={(e) => setMode(e.target.checked)} />
          Display as block (centered, larger)
        </label>

        <div className="min-h-16 rounded-md border border-border p-3 flex items-center justify-center overflow-x-auto">
          {error ? (
            <span className="text-sm text-destructive">Invalid LaTeX</span>
          ) : draft.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <span className="text-sm text-muted-foreground">Preview appears here</span>
          )}
        </div>

        <Button
          type="button"
          onClick={() => onSave(draft.trim(), mode)}
          disabled={!draft.trim() || error}
        >
          Insert Equation
        </Button>
    </EditorDialog>
  );
}
