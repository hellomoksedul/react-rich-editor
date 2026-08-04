"use client";

import { Editor } from "@tiptap/react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface FindReplaceProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  initialSearchTerm?: string;
}

export function FindReplace({
  editor,
  isOpen,
  onClose,
  initialSearchTerm = "",
}: FindReplaceProps) {
  const searchId = useId();
  const replaceId = useId();
  const caseSensitiveId = useId();
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  // Update search term when modal opens with initial value
  useEffect(() => {
    if (isOpen && initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [isOpen, initialSearchTerm]);

  // Live search - update matches as user types
  useEffect(() => {
    if (!searchTerm || !editor) {
      setTotalMatches(0);
      setCurrentMatch(0);
      return;
    }

    const text = editor.state.doc.textContent;
    const regex = new RegExp(
      searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      caseSensitive ? "g" : "gi"
    );
    const matches = text.match(regex);
    setTotalMatches(matches?.length || 0);

    if (matches && matches.length > 0) {
      setCurrentMatch(1);
    } else {
      setCurrentMatch(0);
    }
  }, [searchTerm, caseSensitive, editor]);

  const replaceOne = () => {
    if (!searchTerm || !editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    const matches = caseSensitive
      ? selectedText === searchTerm
      : selectedText.toLowerCase() === searchTerm.toLowerCase();

    if (matches) {
      editor.chain().focus().insertContentAt({ from, to }, replaceTerm).run();
      findNext();
      onClose(); // Close dialog after replace
    } else {
      findNext();
    }
  };

  const replaceAll = () => {
    if (!searchTerm || !editor) return;

    const text = editor.getText();
    const regex = new RegExp(
      searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      caseSensitive ? "g" : "gi"
    );

    const newText = text.replace(regex, replaceTerm);
    editor.commands.setContent(newText);
    setTotalMatches(0);
    setCurrentMatch(0);
    onClose(); // Close dialog after replace all
  };

  const findNext = () => {
    if (currentMatch < totalMatches) {
      setCurrentMatch(currentMatch + 1);
    }
  };

  const findPrevious = () => {
    if (currentMatch > 1) {
      setCurrentMatch(currentMatch - 1);
    }
  };

  if (!editor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Find & Replace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Find Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={searchId}>Find</Label>
              {totalMatches > 0 && (
                <span className="text-xs text-muted-foreground">
                  {currentMatch} of {totalMatches}{" "}
                  {totalMatches === 1 ? "match" : "matches"}
                </span>
              )}
              {searchTerm && totalMatches === 0 && (
                <span className="text-xs text-destructive">
                  No matches found
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id={searchId}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search text..."
                className="flex-1"
                autoFocus
              />
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={findPrevious}
                  disabled={currentMatch <= 1 || totalMatches === 0}
                  title="Previous (Shift+Enter)"
                  className="h-10 w-10 p-0"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={findNext}
                  disabled={currentMatch >= totalMatches || totalMatches === 0}
                  title="Next (Enter)"
                  className="h-10 w-10 p-0"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Replace Input */}
          <div className="space-y-2">
            <Label htmlFor={replaceId}>Replace with</Label>
            <Input
              id={replaceId}
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Replacement text..."
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={caseSensitiveId}
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label
              htmlFor={caseSensitiveId}
              className="text-sm font-normal cursor-pointer"
            >
              Match case
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={replaceOne}
              disabled={totalMatches === 0}
            >
              Replace
            </Button>
            <Button
              variant="default"
              onClick={replaceAll}
              disabled={totalMatches === 0}
            >
              Replace All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
