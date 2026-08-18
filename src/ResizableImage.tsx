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
} from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import { ImageCropper } from "./ui/ImageCropper";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function ResizableImage({
  node,
  updateAttributes,
  selected,
  deleteNode,
}: NodeViewProps) {
  const altTextId = useId();
  const titleTextId = useId();
  const [alt, setAlt] = useState(node.attrs.alt || "");
  const [title, setTitle] = useState(node.attrs.title || "");
  // Local align state for UI, though we generally rely on node.attrs
  const [align, setAlign] = useState(node.attrs.align || "center");
  const [isFullWidth, setIsFullWidth] = useState(node.attrs.fullWidth === true); // Default false
  const [displayMode, setDisplayMode] = useState(node.attrs.display || "block"); // block or inline
  const [isResizing, setIsResizing] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setAlt(node.attrs.alt || "");
    setTitle(node.attrs.title || "");
    setAlign(node.attrs.align || "center");
    setIsFullWidth(node.attrs.fullWidth !== false); // Default true
    setDisplayMode(node.attrs.display || "block");
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

  const handleDisplayMode = (mode: "block" | "inline") => {
    setDisplayMode(mode);
    updateAttributes({ display: mode });
    // Inline images can't be full width
    if (mode === "inline") {
      setIsFullWidth(false);
      updateAttributes({ fullWidth: false, display: mode });
    }
  };

  // Compute wrapper styles based on alignment
  const getWrapperStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: "relative",
      lineHeight: 0,
      maxWidth: "100%",
    };

    // Handle inline display
    if (displayMode === "inline") {
      baseStyle.display = "inline-block";
      baseStyle.verticalAlign = "middle";
      baseStyle.marginLeft = "0.25rem";
      baseStyle.marginRight = "0.25rem";
      const defaultWidth = 200; // Smaller for inline
      const w =
        node.attrs.width && node.attrs.width !== "auto"
          ? `${node.attrs.width}px`
          : `${defaultWidth}px`;
      baseStyle.width = w;
      baseStyle.height = "auto";
      return baseStyle;
    }

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
      display: displayMode === "inline" ? "inline-block" : "block",
      maxWidth: "100%",
      width: isFullWidth ? "100%" : "max-content",
      outline: "none",
    };
    if (isFullWidth) return style;

    if (align === "left") {
      style.float = "left";
      style.marginRight = "1rem";
    } else if (align === "right") {
      style.float = "right";
      style.marginLeft = "1rem";
    } else if (align === "center") {
      style.marginLeft = "auto";
      style.marginRight = "auto";
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

  return (
    <NodeViewWrapper
      className="resizable-image-wrapper-node-view clear-none"
      as="div"
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
        {(selected || isResizing) && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: "1.5px solid var(--primary, #3b82f6)",
              boxSizing: "border-box",
            }}
          />
        )}

        {/* Resize Handles */}
        {(selected || isResizing) && !isCropperOpen && (
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
        {!isResizing && (
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
                  {/* Display Setting */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          displayMode === "inline" ? "default" : "secondary"
                        }
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleDisplayMode("inline")}
                      >
                        Inline
                      </Button>
                      <Button
                        variant={
                          displayMode === "block" ? "default" : "secondary"
                        }
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleDisplayMode("block")}
                      >
                        Block
                      </Button>
                    </div>
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
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={deleteNode}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Image
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {isCropperOpen && (
        <ImageCropper
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={node.attrs.src}
          onCropApply={(base64Str) => {
            updateAttributes({
              src: base64Str,
              width: null,
              height: null,
            });
          }}
        />
      )}
    </NodeViewWrapper>
  );
}
