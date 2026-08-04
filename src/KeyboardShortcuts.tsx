"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: "Text Formatting",
    items: [
      { keys: "Ctrl + B", action: "Bold" },
      { keys: "Ctrl + I", action: "Italic" },
      { keys: "Ctrl + U", action: "Underline" },
      { keys: "Ctrl + Shift + X", action: "Strikethrough" },
      { keys: "Ctrl + E", action: "Inline Code" },
    ],
  },
  {
    category: "Headings",
    items: [
      { keys: "Ctrl + Alt + 1", action: "Heading 1" },
      { keys: "Ctrl + Alt + 2", action: "Heading 2" },
      { keys: "Ctrl + Alt + 3", action: "Heading 3" },
      { keys: "Ctrl + Alt + 4", action: "Heading 4" },
      { keys: "Ctrl + Alt + 5", action: "Heading 5" },
      { keys: "Ctrl + Alt + 6", action: "Heading 6" },
      { keys: "Ctrl + Alt + 0", action: "Paragraph" },
    ],
  },
  {
    category: "Lists",
    items: [
      { keys: "Ctrl + Shift + 8", action: "Bullet List" },
      { keys: "Ctrl + Shift + 7", action: "Ordered List" },
      { keys: "Ctrl + Shift + 9", action: "Task List" },
      { keys: "Ctrl + Shift + B", action: "Blockquote" },
    ],
  },
  {
    category: "Text Alignment",
    items: [
      { keys: "Ctrl + Shift + L", action: "Align Left" },
      { keys: "Ctrl + Shift + E", action: "Align Center" },
      { keys: "Ctrl + Shift + R", action: "Align Right" },
      { keys: "Ctrl + Shift + J", action: "Justify" },
    ],
  },
  {
    category: "Insert",
    items: [
      { keys: "Ctrl + K", action: "Insert Link" },
      { keys: "Ctrl + Shift + H", action: "Horizontal Rule" },
      { keys: "Ctrl + Alt + C", action: "Code Block" },
    ],
  },
  {
    category: "Actions",
    items: [
      { keys: "Ctrl + Z", action: "Undo" },
      { keys: "Ctrl + Y", action: "Redo" },
      { keys: "Ctrl + F", action: "Find & Replace" },
      { keys: "Ctrl + A", action: "Select All" },
    ],
  },
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto pr-4">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut) => (
                    <div
                      key={shortcut.action}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {shortcut.action}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border border-border">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
