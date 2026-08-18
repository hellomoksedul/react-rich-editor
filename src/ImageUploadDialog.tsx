import {
  FolderOpen,
  ImagePlus,
  Link2,
  Loader2,
  Video as VideoIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import { type MediaItem, resolveImageUpload } from "./lib/image-upload";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";

export interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onListMedia?: () => Promise<MediaItem[]>;
}

type Tab = "upload" | "library" | "url";

export function ImageUploadDialog({
  isOpen,
  onClose,
  onSelect,
  onImageUpload,
  onListMedia,
}: ImageUploadDialogProps) {
  const [tab, setTab] = useState<Tab>("upload");
  const [url, setUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [libraryItems, setLibraryItems] = useState<MediaItem[] | null>(null);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");

  const reset = () => {
    setUrl("");
    setError("");
    setIsUploading(false);
    setTab("upload");
    setLibraryItems(null);
    setLibraryError("");
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
      const resolvedUrl = await resolveImageUpload(file, onImageUpload);
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

  const openLibraryTab = () => {
    setTab("library");
    if (!onListMedia || libraryItems !== null || isLibraryLoading) return;
    setIsLibraryLoading(true);
    setLibraryError("");
    onListMedia()
      .then(setLibraryItems)
      .catch((err) => setLibraryError(err?.message || "Failed to load media."))
      .finally(() => setIsLibraryLoading(false));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-130">
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
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Upload
          </button>
          {onListMedia && (
            <button
              type="button"
              onClick={openLibraryTab}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 font-medium transition-colors",
                tab === "library"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Library
            </button>
          )}
          <button
            type="button"
            onClick={() => setTab("url")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 font-medium transition-colors",
              tab === "url"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Link2 className="h-3.5 w-3.5" />
            URL
          </button>
        </div>

        {tab === "upload" && (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 px-4 py-16 min-h-60 text-center transition-colors hover:border-muted-foreground/40"
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
        )}

        {tab === "library" && (
          <div className="max-h-72 overflow-y-auto hellokit-scrollbar">
            {isLibraryLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : libraryError ? (
              <p className="py-6 text-center text-sm text-destructive">
                {libraryError}
              </p>
            ) : !libraryItems || libraryItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No media found.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {libraryItems.map((item) => (
                  <button
                    type="button"
                    key={item.url}
                    onClick={() => {
                      onSelect(item.url);
                      handleClose();
                    }}
                    title={item.name}
                    className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted hover:ring-2 hover:ring-ring"
                  >
                    {item.type === "video" ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <VideoIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.name || ""}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "url" && (
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
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!url.trim()}
            >
              Insert Image
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
