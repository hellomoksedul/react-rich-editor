import type { Editor } from "@tiptap/react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Heading,
  Image as ImageIcon,
  Link2,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { cn } from "./lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export interface SeoStatsData {
  headings: {
    total: number;
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  links: {
    total: number;
    internal: number;
    external: number;
    empty: number;
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
  };
  paragraphs: number;
  words: number;
  characters: number;
  readingTime: number;
}

export function computeSeoStats(editor: Editor | null): SeoStatsData {
  const stats: SeoStatsData = {
    headings: { total: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
    links: { total: 0, internal: 0, external: 0, empty: 0 },
    images: { total: 0, withAlt: 0, missingAlt: 0 },
    paragraphs: 0,
    words: editor?.storage.characterCount?.words?.() || 0,
    characters: editor?.storage.characterCount?.characters?.() || 0,
    readingTime:
      Math.ceil((editor?.storage.characterCount?.words?.() || 0) / 200) || 1,
  };

  if (!editor || !editor.state || !editor.state.doc) return stats;

  editor.state.doc.descendants((node) => {
    if (node.type.name === "heading") {
      stats.headings.total++;
      const level = node.attrs.level as 1 | 2 | 3 | 4 | 5 | 6;
      if (level >= 1 && level <= 6) {
        stats.headings[`h${level}`]++;
      }
    } else if (node.type.name === "paragraph") {
      if (node.textContent.trim().length > 0) {
        stats.paragraphs++;
      }
    } else if (
      node.type.name === "image" ||
      node.type.name === "resizableImage"
    ) {
      stats.images.total++;
      const alt = (node.attrs.alt || "").trim();
      if (alt.length > 0) {
        stats.images.withAlt++;
      } else {
        stats.images.missingAlt++;
      }
    }

    if (node.marks && node.marks.length > 0) {
      node.marks.forEach((mark) => {
        if (mark.type.name === "link") {
          const href = (mark.attrs.href || "").trim();
          stats.links.total++;
          if (!href || href === "#") {
            stats.links.empty++;
          } else if (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("//")
          ) {
            stats.links.external++;
          } else {
            stats.links.internal++;
          }
        }
      });
    }
  });

  return stats;
}

export function SeoStats({ editor }: { editor: Editor | null }) {
  // Recompute when editor document updates
  const stats = useMemo(() => {
    if (!editor) return computeSeoStats(null);
    return computeSeoStats(editor);
  }, [
    editor,
    editor?.state?.doc,
    editor?.storage?.characterCount?.words?.(),
    editor?.storage?.characterCount?.characters?.(),
  ]);

  // Overall health checks
  const h1Status =
    stats.headings.h1 === 1
      ? "optimal"
      : stats.headings.h1 === 0
        ? "missing"
        : "multiple";

  const altStatus =
    stats.images.total === 0
      ? "none"
      : stats.images.missingAlt === 0
        ? "optimal"
        : "warning";

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Quick Headings Count */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-default transition-colors">
              <Heading className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{stats.headings.total}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            {stats.headings.total === 0 ? (
              <span>No headings</span>
            ) : (
              <span>
                H1: {stats.headings.h1} | H2: {stats.headings.h2} | H3:{" "}
                {stats.headings.h3}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Quick Links Count */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-default transition-colors">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{stats.links.total}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            <span>
              Internal: {stats.links.internal} | External:{" "}
              {stats.links.external}
              {stats.links.empty > 0 && ` (${stats.links.empty} empty)`}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Quick Images Count */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-default transition-colors">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{stats.images.total}</span>
              {stats.images.missingAlt > 0 && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
                  title={`${stats.images.missingAlt} image(s) missing alt text`}
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            {stats.images.total === 0 ? (
              <span>No images</span>
            ) : (
              <span>
                {stats.images.withAlt}/{stats.images.total} with Alt
                {stats.images.missingAlt > 0 &&
                  ` (${stats.images.missingAlt} missing)`}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* SEO Insights Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border",
              (h1Status === "missing" || altStatus === "warning") &&
                "text-amber-600 dark:text-amber-400 font-semibold",
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>SEO</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-80 p-3.5 space-y-3 bg-popover text-popover-foreground border border-border rounded-xl"
        >
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-semibold text-foreground">
                SEO & Content Analysis
              </h4>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              Insights
            </span>
          </div>

          {/* Heading Structure */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Heading className="h-3.5 w-3.5 text-muted-foreground" />
                Headings ({stats.headings.total})
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium flex items-center gap-1",
                  h1Status === "optimal"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              >
                {h1Status === "optimal" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> 1 H1 (Optimal)
                  </>
                ) : h1Status === "missing" ? (
                  <>
                    <AlertTriangle className="h-3 w-3" /> No H1 found
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3" /> {stats.headings.h1}{" "}
                    H1s (Use 1)
                  </>
                )}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1 bg-muted/40 p-1.5 rounded-lg text-center text-[11px]">
              <div>
                <div className="text-[10px] text-muted-foreground">H1</div>
                <div className="font-semibold">{stats.headings.h1}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">H2</div>
                <div className="font-semibold">{stats.headings.h2}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">H3</div>
                <div className="font-semibold">{stats.headings.h3}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">H4</div>
                <div className="font-semibold">{stats.headings.h4}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">H5</div>
                <div className="font-semibold">{stats.headings.h5}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">H6</div>
                <div className="font-semibold">{stats.headings.h6}</div>
              </div>
            </div>
          </div>

          {/* Links Breakdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                Links ({stats.links.total})
              </span>
              <span className="text-[11px] text-muted-foreground">
                {stats.links.total === 0
                  ? "No links"
                  : `${stats.links.total} total`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2 rounded-lg text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Internal:</span>
                <span className="font-semibold">{stats.links.internal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  External <ExternalLink className="h-2.5 w-2.5" />:
                </span>
                <span className="font-semibold">{stats.links.external}</span>
              </div>
            </div>
          </div>

          {/* Images & Alt Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Images ({stats.images.total})
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium flex items-center gap-1",
                  altStatus === "optimal"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : altStatus === "warning"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground",
                )}
              >
                {altStatus === "optimal" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> All have alt text
                  </>
                ) : altStatus === "warning" ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />{" "}
                    {stats.images.missingAlt} missing alt
                  </>
                ) : (
                  "No images"
                )}
              </span>
            </div>
            {stats.images.total > 0 && (
              <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2 rounded-lg text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">With Alt:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {stats.images.withAlt}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Missing Alt:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      stats.images.missingAlt > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {stats.images.missingAlt}
                  </span>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
