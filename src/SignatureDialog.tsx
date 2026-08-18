"use client";

import SignaturePad from "signature_pad";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

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
    let rafId = 0;
    let attempts = 0;

    // The dialog is still running its open animation (and, in some cases,
    // hasn't been laid out at all yet) when this effect first fires, so
    // canvas.offsetWidth/Height can briefly read 0. Sizing the canvas'
    // backing store to 0x0 silently breaks SignaturePad — nothing ever
    // gets drawn, even though the (CSS-sized) white box still shows up
    // fine. Retry on the next frame until we get a real, laid-out size.
    const setupPad = () => {
      if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        if (attempts++ < 60) rafId = requestAnimationFrame(setupPad);
        return;
      }

      // Match the canvas's backing-store resolution to its displayed size
      // so strokes aren't blurry/misaligned on high-DPI screens.
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      pad = new SignaturePad(canvas, { backgroundColor: "rgb(255,255,255)" });
      handleEndStroke = () => setIsEmpty(pad!.isEmpty());
      pad.addEventListener("endStroke", handleEndStroke);
      padRef.current = pad;
      setIsEmpty(true);
    };

    rafId = requestAnimationFrame(setupPad);

    return () => {
      cancelAnimationFrame(rafId);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Signature</DialogTitle>
        </DialogHeader>

        <canvas
          ref={canvasRef}
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
      </DialogContent>
    </Dialog>
  );
}
