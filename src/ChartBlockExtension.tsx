"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EditChartDialog } from "./EditChartDialog";
import { cn } from "./lib/utils";

export type ChartType =
  | "bar"
  | "horizontalBar"
  | "groupedBar"
  | "line"
  | "pie"
  | "donut";

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface ChartBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    chartBlock: {
      /** Insert a new Chart block with sample data. */
      setChartBlock: (
        attrs?: Partial<{
          chartType: ChartType;
          title: string;
          dataPoints: ChartDataPoint[];
        }>,
      ) => ReturnType;
    };
  }
}

export const DEFAULT_CHART_POINTS: ChartDataPoint[] = [
  { label: "Jan", value: 40, color: "#2563eb" },
  { label: "Feb", value: 65, color: "#16a34a" },
  { label: "Mar", value: 50, color: "#ea580c" },
];

function ChartRenderer({
  chartType,
  dataPoints,
}: {
  chartType: ChartType;
  dataPoints: ChartDataPoint[];
}) {
  if (dataPoints.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No data points
      </div>
    );
  }

  if (chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dataPoints}>
          <XAxis dataKey="label" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={dataPoints[0]?.color || "#2563eb"}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "pie" || chartType === "donut") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={dataPoints}
            dataKey="value"
            nameKey="label"
            innerRadius={chartType === "donut" ? "55%" : 0}
            outerRadius="80%"
          >
            {dataPoints.map((point, index) => (
              <Cell key={index} fill={point.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // "bar" and "groupedBar" both render as a single-series bar chart with
  // each bar individually colored — dataPoints only carries one value per
  // label, so true multi-series grouping isn't modeled here (the reference
  // editor's per-point label/value/color rows don't appear to support that
  // either). A richer multi-series data model would be a follow-up.
  const isHorizontal = chartType === "horizontalBar";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dataPoints}
        layout={isHorizontal ? "vertical" : "horizontal"}
      >
        {isHorizontal ? (
          <>
            <XAxis type="number" fontSize={12} />
            <YAxis type="category" dataKey="label" fontSize={12} width={70} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} />
          </>
        )}
        <Tooltip />
        <Bar dataKey="value">
          {dataPoints.map((point, index) => (
            <Cell key={index} fill={point.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartBlockView({
  node,
  updateAttributes,
  selected,
  editor,
  deleteNode,
}: NodeViewProps) {
  const { chartType, title, dataPoints } = node.attrs as {
    chartType: ChartType;
    title: string;
    dataPoints: ChartDataPoint[];
  };
  const [isEditing, setIsEditing] = useState(false);

  return (
    <NodeViewWrapper
      data-chart-block-wrapper=""
      className={cn(
        "group relative my-2 rounded-md border border-border p-3",
        // Removed selected outline per user request
      )}
    >
      {title && (
        <div className="mb-2 text-center text-sm font-medium text-foreground">
          {title}
        </div>
      )}
      <div className="h-64 w-full">
        <ChartRenderer chartType={chartType} dataPoints={dataPoints} />
      </div>

      {editor.isEditable && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            contentEditable={false}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-2 py-1 text-xs font-medium shadow-sm hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Chart
          </button>
          <button
            type="button"
            onClick={deleteNode}
            contentEditable={false}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/90 text-muted-foreground shadow-sm hover:bg-accent hover:text-destructive"
            title="Delete Chart"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <EditChartDialog
        isOpen={isEditing}
        chartType={chartType}
        title={title}
        dataPoints={dataPoints}
        onClose={() => setIsEditing(false)}
        onSave={(next) => {
          updateAttributes(next);
          setIsEditing(false);
        }}
      />
    </NodeViewWrapper>
  );
}

/** A chart block (bar/horizontal-bar/grouped-bar/line/pie/donut), rendered
 * with Recharts, with a hover "Edit Chart" overlay opening EditChartDialog. */
export const ChartBlock = Node.create<ChartBlockOptions>({
  name: "chartBlock",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      chartType: {
        default: "bar" as ChartType,
        parseHTML: (element) =>
          element.getAttribute("data-chart-type") || "bar",
        renderHTML: (attributes) => ({
          "data-chart-type": attributes.chartType,
        }),
      },
      title: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-title") || "",
        renderHTML: (attributes) => ({ "data-title": attributes.title }),
      },
      dataPoints: {
        default: DEFAULT_CHART_POINTS,
        parseHTML: (element) => {
          try {
            const raw = element.getAttribute("data-points");
            return raw ? JSON.parse(raw) : DEFAULT_CHART_POINTS;
          } catch {
            return DEFAULT_CHART_POINTS;
          }
        },
        renderHTML: (attributes) => ({
          "data-points": JSON.stringify(attributes.dataPoints || []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-chart-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-chart-block": "",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartBlockView);
  },

  addCommands() {
    return {
      setChartBlock:
        (attrs = {}) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                chartType: attrs.chartType ?? "bar",
                title: attrs.title ?? "Chart Title",
                dataPoints: attrs.dataPoints ?? DEFAULT_CHART_POINTS,
              },
            })
            .run();
        },
    };
  },
});
