"use client";

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Crop as CropIcon,
  Maximize,
  Minimize,
  Settings2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import { ImageCropper } from "./ui/ImageCropper";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { EditorDialog } from "./ui/editor-dialog";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { AIIcon } from "./AIIcon";

export function ResizableImage({
  node,
  updateAttributes,
  selected,
  deleteNode,
  editor,
  extension,
}: NodeViewProps) {
  const altTextId = useId();
  const titleTextId = useId();
  const [alt, setAlt] = useState(node.attrs.alt || "");
  const [title, setTitle] = useState(node.attrs.title || "");
  // Local align state for UI, though we generally rely on node.attrs
  const [align, setAlign] = useState(node.attrs.align || "center");
  const [isFullWidth, setIsFullWidth] = useState(
    node.attrs.fullWidth !== false,
  ); // Default true
  const [isResizing, setIsResizing] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setAlt(node.attrs.alt || "");
    setTitle(node.attrs.title || "");
    setAlign(node.attrs.align || "center");
    setIsFullWidth(node.attrs.fullWidth !== false); // Default true
    const formatDim = (dim: string | number) => {
      if (typeof dim === "number") return `${dim}px`;
      if (
        String(dim).endsWith("%") ||
        String(dim).endsWith("px") ||
        dim === "auto"
      )
        return String(dim);
      return `${dim}px`;
    };

    if (containerRef.current && !isResizing) {
      const isFull = node.attrs.fullWidth === true;
      if (isFull) {
        containerRef.current.style.width = "100%";
        containerRef.current.style.height = "auto";
      } else {
        const w = node.attrs.width;
        const h = node.attrs.height;
        if (w) containerRef.current.style.width = formatDim(w);
        if (h) containerRef.current.style.height = formatDim(h);
      }
    }
  }, [node.attrs, isResizing]);

  const handleAlign = (newAlign: "left" | "center" | "right") => {
    setAlign(newAlign);
    updateAttributes({ align: newAlign, fullWidth: false });
    setIsFullWidth(false);
  };

  const handleFullWidth = () => {
    const newFullWidth = !isFullWidth;
    setIsFullWidth(newFullWidth);
    updateAttributes({
      fullWidth: newFullWidth,
      align: newFullWidth ? "center" : "left",
    });
    if (newFullWidth) {
      setAlign("center");
    }
  };

  const handleDelete = () => {
    deleteNode();
  };

  const getWrapperStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: "relative",
      lineHeight: 0,
      maxWidth: "100%",
    };

    // Handle full width
    if (isFullWidth) {
      baseStyle.width = "100%";
      baseStyle.height = "auto";
      baseStyle.display = "block";
      baseStyle.marginLeft = "auto";
      baseStyle.marginRight = "auto";
      return baseStyle;
    }

    // Default width if not set (50% of container for better UX)
    const defaultWidth = 400; // px
    // Helper to format dimension
    const formatDim = (dim: string | number) => {
      if (typeof dim === "number") return `${dim}px`;
      if (
        String(dim).endsWith("%") ||
        String(dim).endsWith("px") ||
        dim === "auto"
      )
        return String(dim);
      return `${dim}px`;
    };

    const w = node.attrs.width
      ? formatDim(node.attrs.width)
      : `${defaultWidth}px`;
    const h = node.attrs.height ? formatDim(node.attrs.height) : "auto";

    baseStyle.width = w;
    baseStyle.height = h;

    return baseStyle;
  };

  const getOuterWrapperStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      display: "inline-block",
      verticalAlign: "middle",
      maxWidth: "100%",
      width: isFullWidth ? "100%" : "max-content",
      outline: "none",
    };
    if (isFullWidth) return style;

    if (align === "left") {
      style.float = "left";
      style.marginRight = "1.5rem";
      style.marginBottom = "1rem";
      style.marginTop = "0.5rem";
    } else if (align === "right") {
      style.float = "right";
      style.marginLeft = "1.5rem";
      style.marginBottom = "1rem";
      style.marginTop = "0.5rem";
    } else if (align === "center") {
      style.display = "block";
      style.marginLeft = "auto";
      style.marginRight = "auto";
      style.marginTop = "1.5rem";
      style.marginBottom = "1.5rem";
    }
    return style;
  };

  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    direction: "se" | "sw" | "ne" | "nw",
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    const startX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const container = containerRef.current;
    if (!container) return;

    const startWidth = container.offsetWidth;
    const img = imgRef.current;
    // Calculate aspect ratio
    const naturalRatio =
      img && img.naturalWidth && img.naturalHeight
        ? img.naturalWidth / img.naturalHeight
        : startWidth / container.offsetHeight;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const clientX =
          "touches" in moveEvent
            ? moveEvent.touches[0]?.clientX
            : moveEvent.clientX;
        if (clientX === undefined) return;
        const dx = clientX - startX;
        let newWidth = startWidth;

        // Simplify for main use cases: expanding horizontally
        // For Left/Center/Right, dragging Right edge (E) expands width positive DX
        if (direction.includes("e")) newWidth += dx;
        if (direction.includes("w")) newWidth -= dx;

        if (newWidth < 100) newWidth = 100;
        const newHeight = newWidth / naturalRatio;

        if (container) {
          container.style.width = `${newWidth}px`;
          container.style.height = `${newHeight}px`;
          if (badgeRef.current) {
            badgeRef.current.textContent = `${Math.round(newWidth)} × ${Math.round(newHeight)}`;
          }
        }
      });
    };

    const onEnd = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsResizing(false);
      if (container) {
        updateAttributes({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  };

  const handleRegenerateClick = () => {
    const onGenerateImage = extension.options?.onGenerateImage;
    if (!onGenerateImage) {
      alert("Please wire up the onGenerateImage prop in <RichTextEditor> to enable image generation.");
      return;
    }
    
    setRegeneratePrompt(alt);
    setIsPopoverOpen(false);
    setIsRegenerateOpen(true);
  };

  const executeRegenerate = async () => {
    if (!regeneratePrompt.trim()) return;

    const onGenerateImage = extension.options?.onGenerateImage;
    if (!onGenerateImage) return;

    setIsRegenerateOpen(false);

    // Save the original src in case we need to revert
    const originalSrc = node.attrs.src;

    // Swap to animated placeholder
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
  <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="16" font-weight="500" fill="#a1a1aa" text-anchor="middle" dominant-baseline="middle">✨ Regenerating image...</text>
</svg>
`)}`;

    updateAttributes({ src: placeholderUrl, alt: regeneratePrompt });

    try {
      let newImageUrl = await onGenerateImage(regeneratePrompt, { aspectRatio });
      
      const onImageUpload = extension.options?.onImageUpload;
      if (onImageUpload) {
        try {
          const response = await fetch(newImageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch regenerated image: ${response.statusText}`);
          }
          const blob = await response.blob();
          const file = new File([blob], `regenerated-image-${Date.now()}.jpg`, { type: "image/jpeg" });
          newImageUrl = await onImageUpload(file);
        } catch (uploadError) {
          console.error("Failed to upload regenerated image:", uploadError);
        }
      }
      
      updateAttributes({ src: newImageUrl });
      setAlt(regeneratePrompt);
    } catch (e: any) {
      alert(e?.message || "Failed to regenerate image.");
      // Rollback to original image on failure
      updateAttributes({ src: originalSrc, alt: alt });
    }
  };

  return (
    <NodeViewWrapper
      className="resizable-image-wrapper-node-view clear-none"
      as="span"
      style={getOuterWrapperStyle()}
    >
      <div
        ref={containerRef}
        className="group relative transition-all"
        style={getWrapperStyle()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={alt}
          title={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            margin: 0,
            pointerEvents: isResizing ? "none" : "auto",
            userSelect: "none",
          }}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* Selection Frame */}
        {editor.isEditable && (selected || isResizing) && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: "1.5px solid var(--primary, #3b82f6)",
              boxSizing: "border-box",
            }}
          />
        )}

        {/* Resize Handles */}
        {editor.isEditable && (selected || isResizing) && !isCropperOpen && (
          <>
            {/* Left handle */}
            <div
              className={`absolute top-1/2 left-0 w-1.5 h-8 bg-background z-20 cursor-w-resize rounded-full shadow-sm hover:scale-y-110 transition-transform touch-none`}
              style={{
                transform: "translate(-50%, -50%)",
                border: "1px solid var(--primary, #3b82f6)",
              }}
              onMouseDown={(e) => handleResizeStart(e, "sw")}
              onTouchStart={(e) => handleResizeStart(e, "sw")}
            />
            {/* Right handle */}
            <div
              className={`absolute top-1/2 right-0 w-1.5 h-8 bg-background z-20 cursor-e-resize rounded-full shadow-sm hover:scale-y-110 transition-transform touch-none`}
              style={{
                transform: "translate(50%, -50%)",
                border: "1px solid var(--primary, #3b82f6)",
              }}
              onMouseDown={(e) => handleResizeStart(e, "se")}
              onTouchStart={(e) => handleResizeStart(e, "se")}
            />
            {/* Corner handles for aesthetic */}
            <div
              className={`absolute top-0 left-0 w-2.5 h-2.5 z-20 cursor-nw-resize rounded-sm shadow-sm touch-none`}
              style={{
                transform: "translate(-50%, -50%)",
                backgroundColor: "var(--primary, #3b82f6)",
                border: "1px solid var(--background, #ffffff)",
              }}
              onMouseDown={(e) => handleResizeStart(e, "nw")}
              onTouchStart={(e) => handleResizeStart(e, "nw")}
            />
            <div
              className={`absolute top-0 right-0 w-2.5 h-2.5 z-20 cursor-ne-resize rounded-sm shadow-sm touch-none`}
              style={{
                transform: "translate(50%, -50%)",
                backgroundColor: "var(--primary, #3b82f6)",
                border: "1px solid var(--background, #ffffff)",
              }}
              onMouseDown={(e) => handleResizeStart(e, "ne")}
              onTouchStart={(e) => handleResizeStart(e, "ne")}
            />
            <div
              className={`absolute bottom-0 left-0 w-2.5 h-2.5 z-20 cursor-sw-resize rounded-sm shadow-sm touch-none`}
              style={{
                transform: "translate(-50%, 50%)",
                backgroundColor: "var(--primary, #3b82f6)",
                border: "1px solid var(--background, #ffffff)",
              }}
              onMouseDown={(e) => handleResizeStart(e, "sw")}
              onTouchStart={(e) => handleResizeStart(e, "sw")}
            />
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 z-20 cursor-se-resize rounded-sm shadow-sm touch-none`}
              style={{
                transform: "translate(50%, 50%)",
                backgroundColor: "var(--primary, #3b82f6)",
                border: "1px solid var(--background, #ffffff)",
              }}
              onMouseDown={(e) => handleResizeStart(e, "se")}
              onTouchStart={(e) => handleResizeStart(e, "se")}
            />
          </>
        )}

        {/* Dimension Badge */}
        {isResizing && (
          <div
            ref={badgeRef}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm text-white text-[11px] font-mono px-2.5 py-1 rounded-md z-30 pointer-events-none shadow-sm"
          >
            {Math.round(containerRef.current?.offsetWidth || 0)} &times;{" "}
            {Math.round(containerRef.current?.offsetHeight || 0)}
          </div>
        )}

        {/* Image Toolbar (Alignment + Alt) */}
        {editor.isEditable && !isResizing && (
          <div
            className={`absolute top-2 right-2 transition-opacity duration-200 z-30 ${
              isPopoverOpen
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow-md bg-popover/90 hover:bg-popover text-popover-foreground backdrop-blur-sm"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end" sideOffset={5}>
                <div className="flex flex-col gap-3">
                  {/* Top Toolbar Row: Align + Size + Display + Crop */}
                  <div className="flex flex-wrap items-center justify-start gap-0.5 bg-muted/50 p-1 rounded-md">
                    {/* Align Controls */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              align === "left" && !isFullWidth
                                ? "secondary"
                                : "ghost"
                            }
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleAlign("left")}
                          >
                            <AlignLeft className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Left</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              align === "center" && !isFullWidth
                                ? "secondary"
                                : "ghost"
                            }
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleAlign("center")}
                          >
                            <AlignCenter className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Center</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              align === "right" && !isFullWidth
                                ? "secondary"
                                : "ghost"
                            }
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleAlign("right")}
                          >
                            <AlignRight className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Right</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Size Toggle Control */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isFullWidth ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              if (isFullWidth) {
                                setIsFullWidth(false);
                                updateAttributes({ fullWidth: false });
                              } else {
                                handleFullWidth();
                              }
                            }}
                          >
                            {isFullWidth ? (
                              <Minimize className="h-3.5 w-3.5" />
                            ) : (
                              <Maximize className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isFullWidth ? "Auto Width" : "Full Width"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Crop Control */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setIsCropperOpen(true)}
                          >
                            <CropIcon className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Crop Image</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Alt Text Input */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={altTextId}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Alt Text
                    </Label>
                    <Input
                      id={altTextId}
                      value={alt}
                      onChange={(e) => setAlt(e.target.value)}
                      onBlur={() => updateAttributes({ alt: alt })}
                      className="h-8 text-xs"
                      placeholder="Image description..."
                    />
                  </div>

                  {/* Title Input */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={titleTextId}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Title Attribute
                    </Label>
                    <Input
                      id={titleTextId}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => updateAttributes({ title: title })}
                      className="h-8 text-xs"
                      placeholder="Hover tooltip text..."
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="flex gap-2">
                    {extension.options?.onGenerateImage && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={handleRegenerateClick}
                      >
                        <AIIcon className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={deleteNode}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {isRegenerateOpen && (
        <EditorDialog
          open={isRegenerateOpen}
          onOpenChange={(open) => setIsRegenerateOpen(open)}
          title="Regenerate Image"
          description="Update your prompt to generate a new image."
          className="w-[95vw] max-w-xl"
        >
          <div className="flex flex-col gap-3">
            <Textarea
              value={regeneratePrompt}
              onChange={(e) => setRegeneratePrompt(e.target.value)}
              placeholder="e.g. A futuristic city at sunset..."
              rows={4}
              className="resize-none"
              autoFocus
            />
            <div className="flex justify-between items-center pt-2">
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
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
                <Button variant="ghost" onClick={() => setIsRegenerateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={executeRegenerate} disabled={!regeneratePrompt.trim()} className="gap-1.5 h-9">
                  <AIIcon className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        </EditorDialog>
      )}

      {isCropperOpen && (
        <ImageCropper
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={node.attrs.src}
          onCropApply={async (base64Str) => {
            const onImageUpload = extension.options?.onImageUpload;
            let finalSrc = base64Str;
            
            if (onImageUpload) {
              // Immediately show the cropped image while uploading
              updateAttributes({
                src: base64Str,
                width: null,
                height: null,
              });
              
              try {
                const response = await fetch(base64Str);
                const blob = await response.blob();
                const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
                finalSrc = await onImageUpload(file);
              } catch (e) {
                console.error("Failed to upload cropped image:", e);
                // On failure, it will just keep the base64 string
              }
            }
            
            updateAttributes({
              src: finalSrc,
              width: null,
              height: null,
            });
          }}
        />
      )}
    </NodeViewWrapper>
  );
}
