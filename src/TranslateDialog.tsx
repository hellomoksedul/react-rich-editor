"use client";

import { Editor } from "@tiptap/react";
import { Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import { EditorDialog } from "./ui/editor-dialog";
import { Input } from "./ui/input";

const SUGGESTED_LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Arabic",
  "Hindi",
  "Bengali",
];

export interface TranslateDialogProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  onTranslate?: (
    language: string,
    text: string,
    onStream?: (chunk: string) => void,
  ) => Promise<string>;
}

export function TranslateDialog({
  editor,
  isOpen,
  onClose,
  onTranslate,
}: TranslateDialogProps) {
  const [language, setLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!language.trim() || !editor) return;

    const { from, to, empty } = editor.state.selection;
    if (empty) {
      setError("Please select some text to translate first.");
      return;
    }

    if (!onTranslate) {
      setError(
        "Please wire up translation logic (onAskAi prop) in <RichTextEditor> to enable translation.",
      );
      return;
    }

    const { DOMSerializer } = await import("@tiptap/pm/model");
    const slice = editor.state.selection.content();
    const serializer = DOMSerializer.fromSchema(editor.schema);
    const frag = serializer.serializeFragment(slice.content);
    const tmp = document.createElement("div");
    tmp.appendChild(frag);
    const selectedHtml = tmp.innerHTML;

    const selectedTextToTranslate =
      selectedHtml || editor.state.doc.textBetween(from, to, " ");

    setIsLoading(true);
    setError("");

    try {
      let currentEnd = to;
      let accumulatedHTML = "";
      let hasStartedStreaming = false;

      editor.view.dispatch(
        editor.state.tr.setMeta("aiLoading", { isLoading: true, from, to }),
      );

      const result = await onTranslate(
        language,
        selectedTextToTranslate,
        (chunk) => {
          if (!hasStartedStreaming) {
            editor.view.dispatch(
              editor.state.tr.setMeta("aiLoading", {
                isLoading: false,
                from: 0,
                to: 0,
              }),
            );
            hasStartedStreaming = true;
          }
          accumulatedHTML += chunk;
          editor
            .chain()
            .focus()
            .setTextSelection({ from, to: currentEnd })
            .insertContent(accumulatedHTML)
            .run();
          currentEnd = editor.state.selection.to;
        },
      );

      editor
        .chain()
        .focus()
        .setTextSelection({ from, to: currentEnd })
        .insertContent(result)
        .run();
      setLanguage("");
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to translate content.");
    } finally {
      setIsLoading(false);
      editor.view.dispatch(
        editor.state.tr.setMeta("aiLoading", {
          isLoading: false,
          from: 0,
          to: 0,
        }),
      );
    }
  };

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setError("");
          onClose();
        }
      }}
      title="Translate"
      description="Enter the language you want to translate the selected text to."
      className="w-[95vw] max-w-sm"
    >
      <div className="flex flex-col gap-4">
        <Input
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="e.g. Spanish, French, Japanese..."
          autoFocus
        />
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors",
                language.toLowerCase() === lang.toLowerCase()
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
              )}
            >
              {lang}
            </button>
          ))}
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="h-9">
            Cancel
          </Button>
          <Button
            onClick={handleTranslate}
            disabled={isLoading || !language.trim()}
            className="gap-1.5 h-9"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            Translate
          </Button>
        </div>
      </div>
    </EditorDialog>
  );
}
