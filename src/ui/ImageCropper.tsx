import {
  RectangleHorizontal,
  RectangleVertical,
  RotateCcw,
  Square,
  SquareDashed,
} from "lucide-react";
import React, { useRef, useState } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "./button";
import { Dialog, DialogContent } from "./dialog";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropApply: (base64Str: string) => void;
}

const ASPECT_RATIOS = [
  { label: "Freeform", value: undefined, icon: SquareDashed },
  { label: "Original", value: "original", icon: RectangleHorizontal },
  { label: "1:1", value: 1, icon: Square },
  { label: "4:3", value: 4 / 3, icon: RectangleHorizontal },
  { label: "16:9", value: 16 / 9, icon: RectangleHorizontal },
  { label: "3:4", value: 3 / 4, icon: RectangleVertical },
  { label: "9:16", value: 9 / 16, icon: RectangleVertical },
];

export function ImageCropper({
  isOpen,
  onClose,
  imageSrc,
  onCropApply,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [selectedRatio, setSelectedRatio] = useState<
    number | string | undefined
  >("original");
  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [originalAspect, setOriginalAspect] = useState<number>(1);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const imgAspect = width / height;
    setOriginalAspect(imgAspect);

    // Initially set to original aspect
    setAspect(imgAspect);

    const crop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, imgAspect, width, height),
      width,
      height,
    );
    setCrop(crop);
  };

  const handleRatioClick = (value: number | string | undefined) => {
    setSelectedRatio(value);

    let newAspect: number | undefined;
    if (value === "original") {
      newAspect = originalAspect;
    } else if (value === undefined) {
      newAspect = undefined;
    } else {
      newAspect = value as number;
    }

    setAspect(newAspect);

    if (imgRef.current && newAspect) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, newAspect, width, height),
        width,
        height,
      );
      setCrop(newCrop);
    }
  };

  const handleReset = () => {
    handleRatioClick("original");
  };

  const handleApply = async () => {
    if (!completedCrop || !imgRef.current) {
      onClose();
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
      );

      const base64Image = canvas.toDataURL("image/jpeg", 0.95);
      onCropApply(base64Image);
      onClose();
    } catch (e) {
      console.error(
        "Failed to crop image. It might be a cross-origin issue.",
        e,
      );
      alert("Cannot crop this image due to cross-origin restrictions.");
    }
  };

  // Convert decimal to ratio string for display
  const getRatioDisplay = (val: number | string | undefined) => {
    if (val === undefined) return "Freeform";
    if (val === "original") return "Original";
    const found = ASPECT_RATIOS.find((r) => r.value === val);
    return found ? found.label : "Custom";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[850px]! p-0 overflow-hidden bg-background shadow-2xl border-border">
        <div className="flex w-full h-full">
          {/* Left Side: Crop Area */}
          <div className="flex-1 relative flex items-center justify-center p-6 min-h-125 min-w-0">
            {/* Transparency Checkerboard pattern background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(var(--muted) 0% 25%, transparent 0% 50%)",
                backgroundSize: "20px 20px",
                opacity: 0.8,
              }}
            />
            <div className="relative z-10 max-h-[60vh] flex items-center justify-center overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className="max-h-[60vh] object-contain"
                  onLoad={onImageLoad}
                  crossOrigin="anonymous" // required for drawing to canvas
                />
              </ReactCrop>
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="w-[320px] shrink-0 bg-background border-l border-border p-6 flex flex-col z-20">
            <div className="mb-6">
              <h2 className="text-lg font-bold">Crop</h2>
              <p className="text-sm text-muted-foreground">
                Choose an aspect ratio and adjust the crop area, then click
                Apply.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-4 hellokit-scrollbar">
              <label className="block mb-3">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-3">
                {ASPECT_RATIOS.map((ratio) => {
                  const isSelected = selectedRatio === ratio.value;
                  return (
                    <button
                      key={ratio.label}
                      onClick={() => handleRatioClick(ratio.value)}
                      className={`flex flex-col items-center justify-center py-3 px-1 rounded-lg border transition-all overflow-hidden ${
                        isSelected
                          ? "border-[#8b5cf6] bg-[#8b5cf6]/10 text-foreground shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                          : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <ratio.icon
                        className={`w-5 h-5 mb-2 shrink-0 ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                        strokeWidth={1.5}
                      />
                      <span className="text-[11px] font-medium leading-none whitespace-nowrap truncate w-full px-1 text-center">
                        {ratio.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex mt-4 items-center justify-between pt-4 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground px-2"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-20 border-border box-border"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="w-20 border border-transparent box-border"
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
