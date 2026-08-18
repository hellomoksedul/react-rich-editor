"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ChartDataPoint, ChartType } from "./ChartBlockExtension";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export interface EditChartDialogProps {
  isOpen: boolean;
  chartType: ChartType;
  title: string;
  dataPoints: ChartDataPoint[];
  onClose: () => void;
  onSave: (next: { chartType: ChartType; title: string; dataPoints: ChartDataPoint[] }) => void;
}

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "horizontalBar", label: "Horizontal Bar" },
  { value: "groupedBar", label: "Grouped Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
  { value: "donut", label: "Donut" },
];

const SWATCHES = ["#2563eb", "#16a34a", "#dc2626", "#ea580c", "#7c3aed", "#0891b2"];

export function EditChartDialog({
  isOpen,
  chartType,
  title,
  dataPoints,
  onClose,
  onSave,
}: EditChartDialogProps) {
  const [typeDraft, setTypeDraft] = useState<ChartType>(chartType);
  const [titleDraft, setTitleDraft] = useState(title);
  const [pointsDraft, setPointsDraft] = useState<ChartDataPoint[]>(dataPoints);

  useEffect(() => {
    if (isOpen) {
      setTypeDraft(chartType);
      setTitleDraft(title);
      setPointsDraft(dataPoints);
    }
  }, [isOpen, chartType, title, dataPoints]);

  const updatePoint = (index: number, patch: Partial<ChartDataPoint>) => {
    setPointsDraft((prev) => prev.map((point, i) => (i === index ? { ...point, ...patch } : point)));
  };

  const addPoint = () => {
    const color = SWATCHES[pointsDraft.length % SWATCHES.length];
    setPointsDraft((prev) => [...prev, { label: `Point ${prev.length + 1}`, value: 0, color }]);
  };

  const removePoint = (index: number) => {
    setPointsDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const total = pointsDraft.reduce((sum, point) => sum + (Number(point.value) || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Edit Chart</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Chart Type</label>
            <Select value={typeDraft} onValueChange={(v) => setTypeDraft(v as ChartType)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder="Chart title"
            />
          </div>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto hellokit-scrollbar">
          {pointsDraft.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="color"
                value={point.color}
                onChange={(e) => updatePoint(index, { color: e.target.value })}
                className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border"
              />
              <Input
                value={point.label}
                onChange={(e) => updatePoint(index, { label: e.target.value })}
                placeholder="Label"
                className="flex-1"
              />
              <Input
                type="number"
                value={point.value}
                onChange={(e) => updatePoint(index, { value: Number(e.target.value) || 0 })}
                placeholder="Value"
                className="w-24"
              />
              <button
                type="button"
                onClick={() => removePoint(index)}
                className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={addPoint} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Point
        </Button>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{pointsDraft.length} points</span>
          <span>Total: {total}</span>
        </div>

        <Button
          type="button"
          onClick={() =>
            onSave({ chartType: typeDraft, title: titleDraft.trim(), dataPoints: pointsDraft })
          }
          disabled={pointsDraft.length === 0}
        >
          Save Chart
        </Button>
      </DialogContent>
    </Dialog>
  );
}
