"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Box,
  Maximize,
  Settings2,
  TextQuote,
  Trash2,
} from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";

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
  const [isFullWidth, setIsFullWidth] = useState(
    node.attrs.fullWidth !== false
  ); // Default true
  const [displayMode, setDisplayMode] = useState(node.attrs.display || "block"); // block or inline
  const [isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setAlt(node.attrs.alt || "");
    setTitle(node.attrs.title || "");
    setAlign(node.attrs.align || "center");
    setIsFullWidth(node.attrs.fullWidth !== false); // Default true
    setDisplayMode(node.attrs.display || "block");
    if (containerRef.current && !isResizing) {
      const w = node.attrs.width;
      const h = node.attrs.height;
      if (w)
        containerRef.current.style.width = w === "auto" ? "auto" : `${w}px`;
      if (h)
        containerRef.current.style.height = h === "auto" ? "auto" : `${h}px`;
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
      baseStyle.marginBottom = "1rem";
      return baseStyle;
    }

    // Default width if not set (50% of container for better UX)
    const defaultWidth = 400; // px
    const w =
      node.attrs.width && node.attrs.width !== "auto"
        ? `${node.attrs.width}px`
        : `${defaultWidth}px`;
    const h =
      node.attrs.height && node.attrs.height !== "auto"
        ? `${node.attrs.height}px`
        : "auto";

    baseStyle.width = w;
    baseStyle.height = h;

    if (align === "center") {
      baseStyle.display = "block";
      baseStyle.marginLeft = "auto";
      baseStyle.marginRight = "auto";
      baseStyle.float = "none";
      baseStyle.marginBottom = "1rem";
    } else if (align === "left") {
      baseStyle.display = "block";
      baseStyle.float = "left";
      baseStyle.marginRight = "1rem";
      baseStyle.marginBottom = "1rem";
    } else if (align === "right") {
      baseStyle.display = "block";
      baseStyle.float = "right";
      baseStyle.marginLeft = "1rem";
      baseStyle.marginBottom = "1rem";
    }

    return baseStyle;
  };

  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    direction: "se" | "sw" | "ne" | "nw"
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
          "touches" in moveEvent ? moveEvent.touches[0]?.clientX : moveEvent.clientX;
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
      className={`resizable-image-wrapper-node-view ${
        // Tiptap's NodeViewWrapper adds its own div.
        // We might need to handle alignment styles ON the wrapper if 'float' behaves weirdly inside it.
        // Actually NodeViewWrapper renders a 'div' or custom tag.
        // We often set alignment on the inner div, but 'float' needs to be on the outer context or inner div needs to not be constrained.
        // Standard practice: Inner div handles float/margin.
        ""
      }`}
      as="div"
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
          className="rounded-sm object-cover w-full h-full block m-0!"
          style={{
            pointerEvents: isResizing ? "none" : "auto",
            userSelect: "none",
          }}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* Selection Frame */}
        {(selected || isResizing) && (
          <div className="absolute inset-0 border-[1.5px] border-primary pointer-events-none rounded-sm" />
        )}

        {/* Resize Handles */}
        {(selected || isResizing) && (
          <>
            <div
              className={`absolute top-0 left-0 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-background border-[1.5px] border-primary z-20 cursor-nw-resize rounded-full shadow-sm hover:scale-110 transition-transform touch-none`}
              style={{ transform: "translate(-50%, -50%)" }}
              onMouseDown={(e) => handleResizeStart(e, "nw")}
              onTouchStart={(e) => handleResizeStart(e, "nw")}
            />
            <div
              className={`absolute top-0 right-0 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-background border-[1.5px] border-primary z-20 cursor-ne-resize rounded-full shadow-sm hover:scale-110 transition-transform touch-none`}
              style={{ transform: "translate(50%, -50%)" }}
              onMouseDown={(e) => handleResizeStart(e, "ne")}
              onTouchStart={(e) => handleResizeStart(e, "ne")}
            />
            <div
              className={`absolute bottom-0 left-0 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-background border-[1.5px] border-primary z-20 cursor-sw-resize rounded-full shadow-sm hover:scale-110 transition-transform touch-none`}
              style={{ transform: "translate(-50%, 50%)" }}
              onMouseDown={(e) => handleResizeStart(e, "sw")}
              onTouchStart={(e) => handleResizeStart(e, "sw")}
            />
            <div
              className={`absolute bottom-0 right-0 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-background border-[1.5px] border-primary z-20 cursor-se-resize rounded-full shadow-sm hover:scale-110 transition-transform touch-none`}
              style={{ transform: "translate(50%, 50%)" }}
              onMouseDown={(e) => handleResizeStart(e, "se")}
              onTouchStart={(e) => handleResizeStart(e, "se")}
            />
          </>
        )}

        {/* Image Toolbar (Alignment + Alt) */}
        {!isResizing && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
            <Popover>
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
                  {/* Alignment Controls */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Align
                    </span>
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
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

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isFullWidth ? "secondary" : "ghost"}
                              size="icon"
                              className="h-7 w-7"
                              onClick={handleFullWidth}
                            >
                              <Maximize className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Full Width</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-border" />

                  {/* Display Mode (Block/Inline) - Single Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Display
                    </span>
                    <Button
                      variant={
                        displayMode === "inline" ? "secondary" : "outline"
                      }
                      size="sm"
                      className="h-7 px-3 text-xs gap-1.5"
                      onClick={() =>
                        handleDisplayMode(
                          displayMode === "block" ? "inline" : "block"
                        )
                      }
                      disabled={isFullWidth}
                    >
                      {displayMode === "block" ? (
                        <>
                          <Box className="h-3 w-3" />
                          Block
                        </>
                      ) : (
                        <>
                          <TextQuote className="h-3 w-3" />
                          Inline
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Separator */}
                  <div className="h-px bg-border" />

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

                  {/* Separator */}
                  <div className="h-px bg-border" />

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Image
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
