"use client";

import SignaturePad from "signature_pad";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { EditorDialog } from "./ui/editor-dialog";

export interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

/** A draw-your-signature pad. On save, exports a PNG data URL and hands it
 * back to the caller, which inserts it as a regular (resizable) image node —
 * a signature is, functionally, just a small image. */
export function SignatureDialog({ isOpen, onClose, onSave }: SignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;

    let pad: SignaturePad | null = null;
    let handleEndStroke: (() => void) | null = null;

    const initPad = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      if (pad) {
        pad.clear();
      } else {
        pad = new SignaturePad(canvas, { backgroundColor: "rgb(255,255,255)" });
        handleEndStroke = () => setIsEmpty(pad!.isEmpty());
        pad.addEventListener("endStroke", handleEndStroke);
        padRef.current = pad;
        setIsEmpty(true);
      }
    };

    // Wait for Radix dialog animation (usually 150ms) to finish
    const timer = setTimeout(initPad, 200);

    return () => {
      clearTimeout(timer);
      if (pad) {
        if (handleEndStroke) pad.removeEventListener("endStroke", handleEndStroke);
        pad.off();
      }
      padRef.current = null;
    };
  }, [isOpen]);

  const handleClear = () => {
    padRef.current?.clear();
    setIsEmpty(true);
  };

  const handleDone = () => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    onSave(padRef.current.toDataURL("image/png"));
  };

  return (
    <EditorDialog open={isOpen} onOpenChange={(open) => !open && onClose()} title="Signature">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="h-40 w-full touch-none rounded-md border-2 border-dashed border-muted-foreground/25 bg-white"
        />

        <div className="flex justify-between gap-2">
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear
          </Button>
          <Button type="button" onClick={handleDone} disabled={isEmpty}>
            Insert Signature
          </Button>
        </div>
    </EditorDialog>
  );
}
