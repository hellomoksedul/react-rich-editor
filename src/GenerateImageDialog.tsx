"use client";

import { Editor } from "@tiptap/react";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { EditorDialog } from "./ui/editor-dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export interface GenerateImageDialogProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate?: (prompt: string, options?: { aspectRatio?: string }) => Promise<string>;
  onImageUpload?: (file: File) => Promise<string>;
}

export function GenerateImageDialog({
  editor,
  isOpen,
  onClose,
  onGenerate,
  onImageUpload,
}: GenerateImageDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim() || !editor) return;

    if (!onGenerate) {
      setError("Please wire up the onGenerateImage prop in <RichTextEditor> to enable image generation.");
      return;
    }

    setError("");
    const currentPrompt = prompt;
    setPrompt("");
    onClose();

    // Insert an animated SVG placeholder into the editor
    const placeholderUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f4f4f5" />
      <stop offset="50%" stop-color="#e4e4e7" />
      <stop offset="100%" stop-color="#f4f4f5" />
    </linearGradient>
    <clipPath id="clip">
      <rect width="100%" height="100%" />
    </clipPath>
  </defs>
  <rect width="100%" height="100%" fill="#f4f4f5" />
  <rect width="200%" height="100%" fill="url(#shimmer)" clip-path="url(#clip)">
    <animate attributeName="x" from="-100%" to="100%" dur="1.5s" repeatCount="indefinite" />
  </rect>
  <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="16" font-weight="500" fill="#a1a1aa" text-anchor="middle" dominant-baseline="middle">✨ Generating image...</text>
</svg>
`)}`;

    // Add a unique ID to the placeholder so we can find it
    const uniquePlaceholder = placeholderUrl + `#${Date.now()}`;
    editor.chain().focus().setImage({ src: uniquePlaceholder, alt: "Generating..." }).run();

    try {
      let imageUrl = await onGenerate(currentPrompt, { aspectRatio });
      
      if (onImageUpload) {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch generated image: ${response.statusText}`);
          }
          const blob = await response.blob();
          const file = new File([blob], `generated-image-${Date.now()}.jpg`, { type: "image/jpeg" });
          imageUrl = await onImageUpload(file);
        } catch (uploadError) {
          console.error("Failed to upload generated image to server:", uploadError);
          // Fallback to the generated URL if upload fails
        }
      }
      
      // Find the placeholder and replace it with the real image
      let found = false;
      editor.state.doc.descendants((node, pos) => {
        if (!found && node.type.name === 'image' && node.attrs.src === uniquePlaceholder) {
           editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, null, {
             ...node.attrs,
             src: imageUrl,
             alt: currentPrompt
           }));
           found = true;
        }
      });
      
      if (!found) {
        // If placeholder was deleted by the user while waiting, just append it
        editor.chain().focus().setImage({ src: imageUrl, alt: currentPrompt }).run();
      }
    } catch (e: any) {
      // If it fails, remove the placeholder and show an alert
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === uniquePlaceholder) {
           editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
        }
      });
      alert(e?.message || "Failed to generate image.");
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
      title="Generate Image"
      description="Describe the image you want to generate."
      className="w-[95vw] max-w-xl"
    >
      <div className="flex flex-col gap-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A futuristic city at sunset..."
          rows={4}
          className="resize-none"
          autoFocus
        />
        {error && (
          <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">1:1 Square</SelectItem>
              <SelectItem value="16:9">16:9 Landscape</SelectItem>
              <SelectItem value="9:16">9:16 Portrait</SelectItem>
              <SelectItem value="4:3">4:3 Landscape</SelectItem>
              <SelectItem value="3:4">3:4 Portrait</SelectItem>
              <SelectItem value="21:9">21:9 Cinematic</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="h-9">
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="gap-1.5 h-9">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
        </div>
      </div>
    </EditorDialog>
  );
}
