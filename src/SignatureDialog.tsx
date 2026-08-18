"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "./ui/button";
import { EditorDialog } from "./ui/editor-dialog";

export interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

/** A draw-your-signature pad using react-signature-canvas. On save, exports a PNG data URL and hands it
 * back to the caller, which inserts it as a regular (resizable) image node. */
export function SignatureDialog({
  isOpen,
  onClose,
  onSave,
}: SignatureDialogProps) {
  const padRef = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Clear pad whenever the dialog is re-opened
  useEffect(() => {
    if (isOpen) {
      padRef.current?.clear();
      setIsEmpty(true);
    }
  }, [isOpen]);

  const handleClear = () => {
    padRef.current?.clear();
    setIsEmpty(true);
  };

  const handleDone = () => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    // We use getTrimmedCanvas to remove unnecessary whitespace around the signature
    onSave(padRef.current.getTrimmedCanvas().toDataURL("image/png"));
  };

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Signature"
    >
      <div className="h-40 w-full rounded-md border-2 border-dashed border-muted-foreground/25 bg-white overflow-hidden touch-none relative">
        <SignatureCanvas
          ref={padRef}
          onEnd={() => setIsEmpty(padRef.current?.isEmpty() ?? true)}
          canvasProps={{
            className: "w-full h-full",
            style: { touchAction: "none" },
          }}
        />
      </div>

      <div className="flex justify-between gap-2 mt-2">
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
