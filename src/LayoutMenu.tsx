import {
  Columns2,
  Columns3,
  PanelLeft,
  PanelRight,
  RectangleHorizontal,
  Trash2,
} from "lucide-react";
import React from "react";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const CenterHeavyIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M8 3v18" />
    <path d="M16 3v18" />
  </svg>
);

interface LayoutMenuProps {
  editor: any;
}

function findLayoutGroup(editor: any) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === "layoutGroup") {
      return { node, pos: $from.before(depth) };
    }
  }
  return null;
}

export function LayoutMenu({ editor }: LayoutMenuProps) {
  const [menuState, setMenuState] = React.useState<{
    show: boolean;
    top: number;
    left: number;
  }>({ show: false, top: 0, left: 0 });

  // Force re-render on editor updates
  const [, setRevision] = React.useState(0);

  React.useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      setRevision((r) => r + 1);

      if (!editor.isActive("layoutGroup")) {
        setMenuState((s) => (s.show ? { ...s, show: false } : s));
        return;
      }

      // Find the parent wrapper using DOM to ensure perfect centering
      const domSelection = window.getSelection();
      let wrapper: Element | null = null;
      if (domSelection && domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0);
        const element =
          range.startContainer instanceof HTMLElement
            ? range.startContainer
            : range.startContainer.parentElement;
        wrapper = element?.closest("[data-layout-group-wrapper]") || null;
      }

      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        setMenuState({
          show: true,
          top: rect.top,
          left: rect.left + rect.width / 2,
        });
      } else {
        setMenuState((s) => (s.show ? { ...s, show: false } : s));
      }
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("update", updateMenu);
    window.addEventListener("scroll", updateMenu, true);
    window.addEventListener("resize", updateMenu);

    updateMenu();

    return () => {
      editor.off("selectionUpdate", updateMenu);
      editor.off("update", updateMenu);
      window.removeEventListener("scroll", updateMenu, true);
      window.removeEventListener("resize", updateMenu);
    };
  }, [editor]);

  if (!editor || !menuState.show) return null;

  const { selection } = editor.state;
  let groupNode = null;
  let groupPos = null;

  if (
    "node" in selection &&
    (selection as any).node?.type?.name === "layoutGroup"
  ) {
    groupNode = (selection as any).node;
    groupPos = selection.from;
  } else {
    const target = findLayoutGroup(editor);
    if (target) {
      groupNode = target.node;
      groupPos = target.pos;
    }
  }

  if (!groupNode || typeof groupPos !== "number") return null;

  const gridCols = groupNode.attrs.gridCols || 2;

  const updateGroup = (attrs: Record<string, any>) => {
    if (typeof groupPos !== "number" || !groupNode) return;

    const targetCols = attrs.gridCols || groupNode.attrs.gridCols;
    let currentCols = 0;
    groupNode.forEach((child: any) => {
      if (child.type.name === "layoutItem") currentCols++;
    });

    const chain = editor.chain();
    chain.setNodeSelection(groupPos).updateAttributes("layoutGroup", attrs);

    if (targetCols > currentCols) {
      const itemsToAdd = targetCols - currentCols;
      const newItems = Array.from({ length: itemsToAdd }, () => ({
        type: "layoutItem",
        content: [{ type: "paragraph" }],
      }));
      chain.insertContentAt(groupPos + groupNode.nodeSize - 1, newItems);
    } else if (targetCols < currentCols) {
      let childPos = groupPos + 1;
      let childIndex = 0;
      const toDelete: { from: number; to: number }[] = [];
      groupNode.forEach((child: any, offset: number) => {
        if (childIndex >= targetCols) {
          toDelete.push({
            from: childPos + offset,
            to: childPos + offset + child.nodeSize,
          });
        }
        childIndex++;
      });

      for (let i = toDelete.length - 1; i >= 0; i--) {
        chain.deleteRange(toDelete[i]);
      }
    }

    chain.focus().run();
  };

  const TooltipButton = ({
    onClick,
    icon: Icon,
    title,
    active = false,
    className,
  }: any) => (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-1 rounded-md transition-colors", // Slightly larger than before, but standard
            active && "bg-accent text-accent-foreground",
            className,
          )}
          onClick={onClick}
          aria-label={title}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="px-2 py-1 text-[10px]">
        {title}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <div
        style={{
          position: "fixed",
          top: `${menuState.top}px`,
          left: `${menuState.left}px`,
          zIndex: 50,
          pointerEvents: "none", // Prevent the wrapper from blocking clicks
        }}
      >
        <div
          className="flex items-center gap-0.5 rounded-md border border-border bg-background p-1 shadow-md animate-in fade-in zoom-in-95 duration-200"
          style={{
            transform: "translateX(-50%)", // Only translate X. Y is handled mathematically
            pointerEvents: "auto", // Re-enable clicks for the menu itself
            marginTop: "-30px", // Mathematically perfect center (36px height / 2)
          }}
        >
          <TooltipButton
            title="2 Columns"
            icon={Columns2}
            active={gridCols === 2 && !groupNode.attrs.gridTemplate}
            onClick={() => updateGroup({ gridCols: 2, gridTemplate: null })}
          />
          <TooltipButton
            title="3 Columns"
            icon={Columns3}
            active={gridCols === 3 && !groupNode.attrs.gridTemplate}
            onClick={() => updateGroup({ gridCols: 3, gridTemplate: null })}
          />
          <TooltipButton
            title="Center Heavy"
            icon={CenterHeavyIcon}
            active={groupNode.attrs.gridTemplate === "1fr 2fr 1fr"}
            onClick={() =>
              updateGroup({ gridCols: 3, gridTemplate: "1fr 2fr 1fr" })
            }
          />
          <TooltipButton
            title="Left Heavy"
            icon={PanelLeft}
            active={groupNode.attrs.gridTemplate === "2fr 1fr"}
            onClick={() =>
              updateGroup({ gridCols: 2, gridTemplate: "2fr 1fr" })
            }
          />
          <TooltipButton
            title="Right Heavy"
            icon={PanelRight}
            active={groupNode.attrs.gridTemplate === "1fr 2fr"}
            onClick={() =>
              updateGroup({ gridCols: 2, gridTemplate: "1fr 2fr" })
            }
          />
          <TooltipButton
            title="Full Width"
            icon={RectangleHorizontal}
            active={gridCols === 1 && !groupNode.attrs.gridTemplate}
            onClick={() => updateGroup({ gridCols: 1, gridTemplate: null })}
          />
          <div className="w-px h-4 bg-border mx-1" />
          <TooltipButton
            title="Delete Layout"
            icon={Trash2}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (typeof groupPos === "number") {
                editor.chain().focus().deleteNode("layoutGroup").run();
              }
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
