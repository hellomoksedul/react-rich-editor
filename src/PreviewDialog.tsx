"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useEffect, useState } from "react";
import { getEditorExtensions } from "./extensions";
import { cn } from "./lib/utils";
import { EditorDialog } from "./ui/editor-dialog";

export interface PreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export function PreviewDialog({ isOpen, onClose, html }: PreviewDialogProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");

  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: html,
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && html !== undefined) {
      editor.commands.setContent(html);
    }
  }, [html, editor, isOpen]);

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={
        <div className="relative flex items-center justify-between w-full pr-8 select-none">
          {/* Left: macOS Window Controls & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 cursor-pointer hover:opacity-80 transition-opacity"
                title="Close"
              />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 inline-block opacity-80" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 inline-block opacity-80" />
            </div>

            <div className="w-px h-3.5 bg-border" />

            <span className="text-xs font-semibold tracking-wide text-foreground/80">
              Preview
            </span>
          </div>

          {/* Center: Icon-only Device Switcher */}
          <div className="absolute left-1/2 -translate-x-1/2 inline-flex items-center rounded-lg border border-border/80 bg-muted/50 p-0.5">
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              className={cn(
                "inline-flex items-center justify-center rounded-md p-1.5 transition-all cursor-pointer",
                deviceMode === "desktop"
                  ? "bg-background text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              )}
              title="Desktop View (100%)"
              aria-label="Desktop View"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode("tablet")}
              className={cn(
                "inline-flex items-center justify-center rounded-md p-1.5 transition-all cursor-pointer",
                deviceMode === "tablet"
                  ? "bg-background text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              )}
              title="Tablet View (768px)"
              aria-label="Tablet View"
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              className={cn(
                "inline-flex items-center justify-center rounded-md p-1.5 transition-all cursor-pointer",
                deviceMode === "mobile"
                  ? "bg-background text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              )}
              title="Mobile View (375px)"
              aria-label="Mobile View"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right Spacer */}
          <div className="w-8 shrink-0" />
        </div>
      }
      className={cn(
        "h-[88vh] max-h-[88vh] p-4 sm:p-6 flex flex-col overflow-hidden gap-0 transition-all duration-300 ease-in-out",
        deviceMode === "desktop" && "w-[95vw] max-w-5xl",
        deviceMode === "tablet" && "w-[95vw] max-w-[760px]",
        deviceMode === "mobile" && "w-[95vw] max-w-[420px]",
      )}
    >
      <div className="mt-4 flex-1 min-h-0 overflow-y-auto hellokit-scrollbar px-1 py-1">
        <div
          className={cn(
            "w-full min-w-0 hellokit-editor-scope hellokit-preview-frame",
            deviceMode === "mobile" && "hellokit-mobile-preview",
            deviceMode === "tablet" && "hellokit-tablet-preview",
          )}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </EditorDialog>
  );
}
