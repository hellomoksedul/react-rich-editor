"use client";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight, Settings2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export function ResizableYoutube({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const [align, setAlign] = useState(node.attrs.align || "left");
  const [isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Sync internal state with node attributes
  useEffect(() => {
    setAlign(node.attrs.align || "left");
    if (containerRef.current && !isResizing) {
      const w = node.attrs.width;
      const h = node.attrs.height;
      if (w)
        containerRef.current.style.width =
          typeof w === "number" ? `${w}px` : w === "auto" ? "auto" : w;
      if (h)
        containerRef.current.style.height =
          typeof h === "number" ? `${h}px` : h === "auto" ? "auto" : h;
    }
  }, [node.attrs, isResizing]);

  const handleAlign = (newAlign: "left" | "center" | "right") => {
    setAlign(newAlign);
    updateAttributes({ align: newAlign });
  };

  const getWrapperStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: "relative",
      lineHeight: 0,
      maxWidth: "100%",
    };

    const w = node.attrs.width;
    const h = node.attrs.height;

    // Default dimensions for video if not set
    baseStyle.width = w ? (typeof w === "number" ? `${w}px` : w) : "640px";
    baseStyle.height = h ? (typeof h === "number" ? `${h}px` : h) : "360px";

    if (align === "center") {
      baseStyle.display = "block";
      baseStyle.marginLeft = "auto";
      baseStyle.marginRight = "auto";
      baseStyle.float = "none";
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
    e: React.MouseEvent,
    direction: "se" | "sw" | "ne" | "nw"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    const startX = e.clientX;
    const container = containerRef.current;
    if (!container) return;

    const startWidth = container.offsetWidth;
    const startHeight = container.offsetHeight;
    const aspectRatio = startWidth / startHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const dx = moveEvent.clientX - startX;
        let newWidth = startWidth;

        if (direction.includes("e")) newWidth += dx;
        if (direction.includes("w")) newWidth -= dx;

        if (newWidth < 200) newWidth = 200; // Minimum width for video
        const newHeight = newWidth / aspectRatio;

        if (container) {
          container.style.width = `${newWidth}px`;
          container.style.height = `${newHeight}px`;
        }
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsResizing(false);
      if (container) {
        updateAttributes({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("/embed/")) return url;

    // Convert watch URLs to embed URLs
    const match = url.match(
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    );
    const videoId = match && match[2].length === 11 ? match[2] : null;

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <NodeViewWrapper as="div">
      <div
        ref={containerRef}
        className="group relative transition-all"
        style={getWrapperStyle()}
      >
        {/* Video Container - Aspect Ratio preservation is handled by resizing logic */}
        <div className="w-full h-full relative bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
          {/* Overlay to capture clicks/drags over iframe */}
          {isResizing && (
            <div className="absolute inset-0 z-10 bg-transparent" />
          )}

          <iframe
            src={getYoutubeEmbedUrl(node.attrs.src)}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ pointerEvents: isResizing || selected ? "none" : "auto" }}
          />
        </div>

        {/* Selection Frame */}
        {(selected || isResizing) && (
          <div className="absolute inset-0 border-[1.5px] border-primary pointer-events-none rounded-sm z-20" />
        )}

        {/* Resize Handles */}
        {(selected || isResizing) && (
          <>
            <div
              className={`absolute top-0 left-0 w-3.5 h-3.5 bg-background border-[1.5px] border-primary z-30 cursor-nw-resize rounded-full shadow-sm hover:scale-110 transition-transform`}
              style={{ transform: "translate(-50%, -50%)" }}
              onMouseDown={(e) => handleResizeStart(e, "nw")}
            />
            <div
              className={`absolute top-0 right-0 w-3.5 h-3.5 bg-background border-[1.5px] border-primary z-30 cursor-ne-resize rounded-full shadow-sm hover:scale-110 transition-transform`}
              style={{ transform: "translate(50%, -50%)" }}
              onMouseDown={(e) => handleResizeStart(e, "ne")}
            />
            <div
              className={`absolute bottom-0 left-0 w-3.5 h-3.5 bg-background border-[1.5px] border-primary z-30 cursor-sw-resize rounded-full shadow-sm hover:scale-110 transition-transform`}
              style={{ transform: "translate(-50%, 50%)" }}
              onMouseDown={(e) => handleResizeStart(e, "sw")}
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-background border-[1.5px] border-primary z-30 cursor-se-resize rounded-full shadow-sm hover:scale-110 transition-transform`}
              style={{ transform: "translate(50%, 50%)" }}
              onMouseDown={(e) => handleResizeStart(e, "se")}
            />
          </>
        )}

        {/* Settings Toolbar */}
        {!isResizing && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow-md bg-white/90 hover:bg-white text-slate-700 backdrop-blur-sm"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2" align="end" sideOffset={5}>
                {/* Alignment Controls */}
                <div className="flex items-center justify-between gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={align === "left" ? "secondary" : "ghost"}
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
                          variant={align === "center" ? "secondary" : "ghost"}
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
                          variant={align === "right" ? "secondary" : "ghost"}
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
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
