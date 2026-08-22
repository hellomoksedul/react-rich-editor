"use client";

import { Editor } from "@tiptap/react";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import { EditorDialog } from "./ui/editor-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

export interface AiProviderConfig {
  id: string;
  label: string;
  model: string;
  color: string;
}

export interface AiCreditsInfo {
  remaining: number;
  total: number;
  planLabel?: string;
}

export interface AskAiParams {
  prompt: string;
  provider: AiProviderConfig;
  onStream?: (chunk: string) => void;
}

/** Resolves to raw HTML (h1, h2, p, ul, ol, strong, em, ...) suitable for
 * insertion straight into the editor. Implement this by calling your own
 * backend — never call an AI provider directly from the client with a real
 * API key. */
export type AskAiHandler = (params: AskAiParams) => Promise<string>;

export const DEFAULT_AI_PROVIDERS: AiProviderConfig[] = [
  { id: "google", label: "Google Gemini", model: "gemini-1.5-pro", color: "#4285f4" },
  { id: "google-flash", label: "Google Gemini Flash", model: "gemini-1.5-flash", color: "#8ab4f8" },
  { id: "anthropic", label: "Anthropic Claude", model: "claude-3.5-sonnet", color: "#d97757" },
  { id: "anthropic-opus", label: "Anthropic Claude Opus", model: "claude-3-opus", color: "#b95c40" },
  { id: "openai", label: "OpenAI ChatGPT", model: "gpt-4o", color: "#10a37f" },
  { id: "openai-mini", label: "OpenAI ChatGPT Mini", model: "gpt-4o-mini", color: "#1a7f64" },
  { id: "deepseek", label: "DeepSeek", model: "deepseek-coder", color: "#4d6bfe" },
  { id: "meta", label: "Meta Llama", model: "llama-3-70b", color: "#0668E1" },
  { id: "xai", label: "xAI Grok", model: "grok-2", color: "#000000" },
];

const RECENT_PROMPTS_LIMIT = 10;
const RECENT_PROMPTS_VISIBLE = 1;

function loadRecentPrompts(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((p) => typeof p === "string")
      : [];
  } catch {
    return [];
  }
}

function saveRecentPrompt(
  key: string,
  prompt: string,
  existing: string[],
): string[] {
  const next = [prompt, ...existing.filter((p) => p !== prompt)].slice(
    0,
    RECENT_PROMPTS_LIMIT,
  );
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Storage unavailable (private browsing, quota, SSR) — recent prompts
    // just won't persist across sessions; not worth surfacing as an error.
  }
  return next;
}

export interface AskAiDialogProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  /** Providers listed in the picker. Defaults to DEFAULT_AI_PROVIDERS. */
  providers?: AiProviderConfig[];
  /** Called with the prompt + selected provider when the user clicks "Ask
   * AI". If omitted, the dialog still opens (so the UI is visible out of the
   * box) but shows a reminder to wire this prop up instead of failing silently. */
  onAskAi?: AskAiHandler;
  /** Optional credits/usage summary. Omit to hide the panel entirely. */
  credits?: AiCreditsInfo;
  /** Called when "Top up" is clicked. Omit to hide the link. */
  onTopUpCredits?: () => void;
  /** localStorage key used to remember recent prompts on this device. */
  recentPromptsStorageKey?: string;
  /** Optional selected content to transform or rewrite with a prompt */
  selectedContext?: {
    text: string;
    html: string;
    range: { from: number; to: number };
  } | null;
  onClearSelectedContext?: () => void;
}

export function AskAiDialog({
  editor,
  isOpen,
  onClose,
  providers = DEFAULT_AI_PROVIDERS,
  onAskAi,
  credits,
  onTopUpCredits,
  recentPromptsStorageKey = "hellokit-ai-recent-prompts",
  selectedContext,
  onClearSelectedContext,
}: AskAiDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [providerId, setProviderId] = useState(providers[0]?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!providers || providers.length === 0) return;
    if (!providerId || !providers.some((p) => p.id === providerId)) {
      setProviderId(providers[0].id);
    }
  }, [providers, providerId]);

  useEffect(() => {
    if (!isOpen) return;
    setRecentPrompts(loadRecentPrompts(recentPromptsStorageKey));
  }, [isOpen, recentPromptsStorageKey]);

  const reset = () => {
    setPrompt("");
    setGeneratedHtml("");
    setError("");
    setIsLoading(false);
    setShowAllRecent(false);
    onClearSelectedContext?.();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectedProvider =
    providers.find((p) => p.id === providerId) || providers[0];

  const handleAskAi = async () => {
    if (!prompt.trim() || !selectedProvider) return;

    if (!onAskAi) {
      setError(
        "No AI provider is connected yet — pass an `onAskAi` prop to <RichTextEditor> to enable this.",
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedHtml("");

    try {
      let fullContent = "";
      const effectivePrompt = selectedContext?.text
        ? `Instructions: ${prompt.trim()}\n\nContent to modify:\n${selectedContext.html || selectedContext.text}\n\nIMPORTANT: Output ONLY the updated content to directly replace the selection. Preserve existing HTML formatting where appropriate and do NOT wrap output in markdown fences.`
        : prompt.trim();

      const content = await onAskAi({
        prompt: effectivePrompt,
        provider: selectedProvider,
        onStream: (chunk) => {
           fullContent += chunk;
           // Clean up markdown code fences some models wrap HTML in.
           const cleanHtml = fullContent
             .replace(/^```html\s*/i, "")
             .replace(/^```\s*/i, "")
             .replace(/```$/i, "")
             .replace(/[\r\n]+/g, "")
             .trim();
           setGeneratedHtml(cleanHtml);
        }
      });

      // Final cleanup using the resolved content from the promise
      const cleanHtml = content
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .replace(/[\r\n]+/g, "")
        .trim();

      setGeneratedHtml(cleanHtml);
      setRecentPrompts(
        saveRecentPrompt(recentPromptsStorageKey, prompt.trim(), recentPrompts),
      );
    } catch (err: any) {
      setError(
        err?.message || "Something went wrong talking to the AI provider.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowInEditor = () => {
    if (!editor || !generatedHtml) return;
    if (selectedContext?.range) {
      editor
        .chain()
        .focus()
        .setTextSelection(selectedContext.range)
        .insertContent(generatedHtml)
        .run();
    } else {
      editor.chain().focus().insertContent(generatedHtml).run();
    }
    handleClose();
  };

  const useRecentPrompt = (value: string) => {
    setPrompt(value);
    textareaRef.current?.focus();
  };

  const visibleRecent = showAllRecent
    ? recentPrompts
    : recentPrompts.slice(0, RECENT_PROMPTS_VISIBLE);

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="Ask AI"
      description={
        selectedContext
          ? "Ask AI to rewrite, refine, or update the selected content."
          : "Quick assistance for improving, translating, or generating content."
      }
      className="w-[95vw] max-w-2xl"
    >
      <div className="flex min-w-0 flex-col gap-3">
        {selectedContext && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground shrink-0">Selected:</span>
              <span className="text-muted-foreground truncate italic">
                "{selectedContext.text.slice(0, 80)}{selectedContext.text.length > 80 ? "..." : ""}"
              </span>
            </div>
            {onClearSelectedContext && (
              <button
                type="button"
                onClick={onClearSelectedContext}
                className="text-[11px] text-muted-foreground hover:text-foreground font-medium shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div>
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              selectedContext
                ? "e.g., Rewrite in a professional tone, Make it more concise, Convert into bullet points, Translate..."
                : "e.g., Write a paragraph about..., Generate an outline for..."
            }
            rows={selectedContext ? 5 : 7}
            className="resize-none"
            autoFocus
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedProvider?.id || providerId} onValueChange={setProviderId}>
              <SelectTrigger className="w-45 h-9">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAskAi}
              disabled={!prompt.trim() || isLoading}
              className="gap-1.5 h-9"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Asking AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Ask AI
                </>
              )}
            </Button>
          </div>
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {generatedHtml && (
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
              Preview
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-primary hover:bg-transparent hover:underline"
                onClick={handleShowInEditor}
              >
                {selectedContext ? "Replace Selection" : "Insert into Editor"}
              </Button>
            </label>
            <div
              className="hellokit-editor-scope max-h-50 overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm"
              dangerouslySetInnerHTML={{ __html: generatedHtml }}
            />
          </div>
        )}

        {recentPrompts.length > 0 && (
          <div className="mt-1">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Recent Prompts {visibleRecent.length}/{recentPrompts.length}
              </span>
              {recentPrompts.length > RECENT_PROMPTS_VISIBLE && (
                <button
                  type="button"
                  onClick={() => setShowAllRecent((v) => !v)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {showAllRecent
                    ? "Show less"
                    : `Show ${recentPrompts.length - RECENT_PROMPTS_VISIBLE} more ›`}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {visibleRecent.map((p, i) => (
                <div
                  key={`${p}-${i}`}
                  className="flex items-start gap-2 rounded-md border-l-2 border-primary bg-muted/40 p-2"
                >
                  <p
                    className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
                    title={p}
                  >
                    {p}
                  </p>
                  <button
                    type="button"
                    onClick={() => useRecentPrompt(p)}
                    className="shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Use prompt ↗
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {credits && (
          <div className="mt-2 flex items-center justify-between rounded-md border border-border p-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-foreground">
                {credits.remaining}
              </span>{" "}
              credits remaining
              {credits.planLabel && (
                <span className="text-xs opacity-75">
                  ({credits.planLabel})
                </span>
              )}
            </div>
            {onTopUpCredits && (
              <button
                type="button"
                onClick={onTopUpCredits}
                className="font-medium text-primary hover:underline"
              >
                Top up ↗
              </button>
            )}
          </div>
        )}
      </div>
    </EditorDialog>
  );
}
