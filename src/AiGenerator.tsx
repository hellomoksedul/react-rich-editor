import { Editor } from "@tiptap/react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface AiGeneratorProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called with the user's prompt. Must resolve to raw HTML content
   * (h1, h2, p, ul, ol, strong, em, ...) suitable for insertion into the editor.
   */
  onGenerate: (prompt: string) => Promise<string>;
}

export function AiGenerator({ editor, isOpen, onClose, onGenerate }: AiGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");
    setGeneratedText("");

    try {
      let content = await onGenerate(prompt);

      // Clean up markdown code blocks if present
      content = content
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "");

      // Aggressively remove all newlines to prevent any unwanted spacing issues
      // This ensures the content is treated as a continuous stream of HTML tags
      content = content.replace(/[\r\n]+/g, "").trim();

      setGeneratedText(content);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (editor && generatedText) {
      editor.commands.insertContent(generatedText);
      onClose();
      // Reset state
      setPrompt("");
      setGeneratedText("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI Content Generator
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">What would you like to write?</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., Write a blog post introduction about the benefits of meditation..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">Error: {error}</div>
          )}

          {generatedText && (
            <div className="grid gap-2">
              <Label>Preview</Label>
              <div
                className="max-h-[200px] overflow-y-auto w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                dangerouslySetInnerHTML={{ __html: generatedText }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>

          {!generatedText ? (
            <Button onClick={handleGenerate} disabled={!prompt.trim() || isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setGeneratedText("")} disabled={isLoading}>
                Try Again
              </Button>
              <Button onClick={handleInsert} className="gap-2">
                Insert Content
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
