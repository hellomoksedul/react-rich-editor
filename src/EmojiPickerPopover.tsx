"use client";

import { Editor } from "@tiptap/react";
import { Loader2, Search, Shapes, Smile } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CORE_EMOJIS, EmojiItem, getFullEmojiList } from "./lib/emoji-api";
import {
  fetchIconSvg,
  getAllMasterIcons,
  IconInfo,
  POPULAR_ICONS,
  searchIcons,
} from "./lib/icon-api";
import { cn } from "./lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface EmojiPickerPopoverProps {
  editor: Editor | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function IconPreviewItem({
  icon,
  onSelect,
}: {
  icon: IconInfo;
  onSelect: (icon: IconInfo, svg: string) => void;
}) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    fetchIconSvg(icon.id).then((data) => {
      if (isMounted) setSvg(data);
    });
    return () => {
      isMounted = false;
    };
  }, [icon.id]);

  return (
    <button
      type="button"
      onClick={() => onSelect(icon, svg)}
      title={`${icon.title} (${icon.prefix})`}
      className="flex flex-col h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent hover:scale-105 active:scale-95 transition-all cursor-pointer select-none p-1.5"
    >
      {svg ? (
        <span
          className="inline-flex items-center justify-center w-5 h-5 [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <span className="w-4 h-4 rounded bg-muted/40 animate-pulse" />
      )}
    </button>
  );
}

export function EmojiPickerPopover({
  editor,
  isOpen,
  onOpenChange,
  children,
}: EmojiPickerPopoverProps) {
  const [activeTab, setActiveTab] = useState<"icons" | "emojis">("icons");
  const [search, setSearch] = useState("");

  const [emojisList, setEmojisList] = useState<EmojiItem[]>(CORE_EMOJIS);
  const [visibleEmojiCount, setVisibleEmojiCount] = useState(120);

  const [iconsList, setIconsList] = useState<IconInfo[]>(POPULAR_ICONS);
  const [visibleIconCount, setVisibleIconCount] = useState(120);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load all master icons when popover opens
  useEffect(() => {
    getAllMasterIcons().then((master) => {
      if (master && master.length > POPULAR_ICONS.length) {
        setIconsList(master);
      }
    });
  }, []);

  // Lazy load full emoji dataset
  useEffect(() => {
    if (activeTab === "emojis") {
      getFullEmojiList().then((list) => {
        if (list && list.length > CORE_EMOJIS.length) {
          setEmojisList(list);
        }
      });
    }
  }, [activeTab]);

  // Search icons & emojis
  useEffect(() => {
    if (activeTab !== "icons") return;

    if (!search.trim()) {
      getAllMasterIcons().then((master) => {
        setIconsList(master);
        setVisibleIconCount(120);
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      searchIcons(search, 180)
        .then((results) => {
          setIconsList(results);
          setVisibleIconCount(120);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const filteredEmojis = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return emojisList;
    return emojisList.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }, [search, emojisList]);

  const handleIconScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      setVisibleIconCount((prev) => Math.min(prev + 60, iconsList.length));
    }
  };

  const handleEmojiScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      setVisibleEmojiCount((prev) => Math.min(prev + 60, filteredEmojis.length));
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
    onOpenChange(false);
  };

  const handleSelectIcon = (icon: IconInfo, svg: string) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "iconNode",
        attrs: {
          name: icon.id,
          size: 24,
          color: "currentColor",
          strokeWidth: 2,
          svg,
        },
      })
      .run();
    onOpenChange(false);
  };

  const visibleIcons = useMemo(() => {
    return iconsList.slice(0, visibleIconCount);
  }, [iconsList, visibleIconCount]);

  const visibleEmojis = useMemo(() => {
    return filteredEmojis.slice(0, visibleEmojiCount);
  }, [filteredEmojis, visibleEmojiCount]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-80 p-2.5 border border-border bg-popover rounded-xl shadow-xl hellokit-editor-scope"
        align="center"
        sideOffset={6}
      >
        {/* Top Tab Switcher (Icons / Emojis) */}
        <div className="flex items-center rounded-lg bg-muted/60 p-0.5 mb-2.5 select-none">
          <button
            type="button"
            onClick={() => {
              setActiveTab("icons");
              setSearch("");
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
              activeTab === "icons"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            <Shapes className="h-3.5 w-3.5" />
            <span>Icons</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("emojis");
              setSearch("");
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
              activeTab === "emojis"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
            )}
          >
            <Smile className="h-3.5 w-3.5" />
            <span>Emojis</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative mb-2 flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "icons"
                ? "Search 200,000+ icons (lucide, tabler, ri)..."
                : "Search all emojis..."
            }
            className="h-8 w-full rounded-md border border-border bg-muted/40 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:bg-background transition-colors"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 h-3 w-3 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Continuous Emojis View */}
        {activeTab === "emojis" && (
          <div
            onScroll={handleEmojiScroll}
            className="h-64 overflow-y-auto hellokit-scrollbar pr-0.5"
          >
            {visibleEmojis.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No emojis found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-8 gap-1">
                  {visibleEmojis.map((item, idx) => (
                    <button
                      key={`${item.emoji}-${idx}`}
                      type="button"
                      onClick={() => handleSelectEmoji(item.emoji)}
                      title={item.name}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-accent hover:scale-110 active:scale-95 transition-all cursor-pointer select-none"
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
                {visibleEmojiCount < filteredEmojis.length && (
                  <div className="py-2 flex justify-center text-[11px] text-muted-foreground">
                    Scroll down for more ({visibleEmojiCount} / {filteredEmojis.length})
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Continuous Icons View (Master list with infinite scroll) */}
        {activeTab === "icons" && (
          <div
            ref={scrollRef}
            onScroll={handleIconScroll}
            className="h-64 overflow-y-auto hellokit-scrollbar pr-0.5"
          >
            {visibleIcons.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                {isLoading ? "Loading icons..." : "No icons found"}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-6 gap-1">
                  {visibleIcons.map((item) => (
                    <IconPreviewItem
                      key={item.id}
                      icon={item}
                      onSelect={handleSelectIcon}
                    />
                  ))}
                </div>
                {visibleIconCount < iconsList.length && (
                  <div className="py-2 flex justify-center text-[11px] text-muted-foreground">
                    Scroll down for more ({visibleIconCount} / {iconsList.length})
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
