import { ImagePlus, Link2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { cn } from "./lib/utils";

export interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  /**
   * Handle the actual upload (e.g. to S3/R2/Cloudinary) and resolve the
   * final public URL. When omitted, the picked file is embedded as a
   * base64 data URL instead.
   */
  onImageUpload?: (file: File) => Promise<string>;
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  onSelect,
  onImageUpload,
}: ImageUploadDialogProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setUrl("");
    setError("");
    setIsUploading(false);
    setTab("upload");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      const resolvedUrl = onImageUpload
        ? await onImageUpload(file)
        : await readAsDataUrl(file);
      onSelect(resolvedUrl);
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!url.trim()) return;
    onSelect(url.trim());
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-1 rounded-md bg-muted/50 p-1 text-sm">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 font-medium transition-colors",
              tab === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 font-medium transition-colors",
              tab === "url"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Link2 className="h-3.5 w-3.5" />
            URL
          </button>
        </div>

        {tab === "upload" ? (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 px-4 py-10 text-center transition-colors hover:border-muted-foreground/40"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image, or{" "}
                  <button
                    type="button"
                    className="text-primary underline underline-offset-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUrlSubmit();
              }}
              autoFocus
            />
            <Button type="button" onClick={handleUrlSubmit} disabled={!url.trim()}>
              Insert Image
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
