"use client";

import { Loader2, Paperclip } from "lucide-react";
import { useRef, useState } from "react";

import { resolveFileUpload } from "./lib/file-upload";
import { EditorDialog } from "./ui/editor-dialog";

export interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (attrs: { url: string; name: string; size: number }) => void;
  onFileUpload?: (file: File) => Promise<string>;
}

export function FileUploadDialog({ isOpen, onClose, onSelect, onFileUpload }: FileUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setIsUploading(false);
    setError("");
    onClose();
  };

  const handleFile = async (file: File) => {
    setError("");
    setIsUploading(true);
    try {
      const meta = await resolveFileUpload(file, onFileUpload);
      onSelect(meta);
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <EditorDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} title="Upload File">
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
              <Paperclip className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop a file, or{" "}
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
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
    </EditorDialog>
  );
}
