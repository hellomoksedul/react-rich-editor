import { EditorContent, useEditor } from "@tiptap/react";
import { Loader2 } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { useEffect, useState } from "react";
import CodeEditor from "react-simple-code-editor";

import { AiGenerator } from "./AiGenerator";
import { getEditorExtensions } from "./extensions";
import { FindReplace } from "./FindReplace";
import { ImageUploadDialog } from "./ImageUploadDialog";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { TableBubbleMenu } from "./TableBubbleMenu";
import { Toolbar } from "./Toolbar";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  isSimple?: boolean;
  toolbarPosition?: "top" | "bottom";
  /**
   * Handle uploading a picked/dropped image file and resolve its public URL.
   * When omitted, images are embedded as base64 data URLs instead.
   */
  onImageUpload?: (file: File) => Promise<string>;
  /**
   * Handle an AI content generation request. When omitted, the AI
   * Generator toolbar button and dialog are hidden entirely.
   */
  onAiGenerate?: (prompt: string) => Promise<string>;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing...",
  className,
  isSimple = false,
  toolbarPosition = "top",
  onImageUpload,
  onAiGenerate,
}: RichTextEditorProps) {
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [selectedTextForSearch, setSelectedTextForSearch] = useState("");
  const [sourceCode, setSourceCode] = useState("");

  const editor = useEditor({
    extensions: getEditorExtensions(placeholder),
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `focus:outline-none ${isSimple ? "simple-mode" : ""}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Handle Ctrl+F keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();

        // Get selected text if any
        if (editor) {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to);
          setSelectedTextForSearch(selectedText);
        }

        setIsFindReplaceOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  const handleImageUpload = () => {
    setIsImageManagerOpen(true);
  };

  const handleImageSelect = (url: string) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const toggleSourceMode = (mode: boolean) => {
    if (mode) {
      // Switching TO Source Mode
      setSourceCode(editor?.getHTML() || "");
    } else {
      // Switching FROM Source Mode
      if (editor) {
        editor.commands.setContent(sourceCode);
      }
    }
    setIsSourceMode(mode);
  };

  if (!editor) {
    return (
      <div className="flex h-[400px] items-center justify-center border border-border rounded-md">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={className ? className : "border border-border rounded-md overflow-hidden"}>
        {toolbarPosition === "top" && (
          <Toolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            isFindReplaceOpen={isFindReplaceOpen}
            setIsFindReplaceOpen={setIsFindReplaceOpen}
            isShortcutsOpen={isShortcutsOpen}
            setIsShortcutsOpen={setIsShortcutsOpen}
            isAiGeneratorOpen={isAiGeneratorOpen}
            setIsAiGeneratorOpen={setIsAiGeneratorOpen}
            isSourceMode={isSourceMode}
            setIsSourceMode={toggleSourceMode}
            isSimple={isSimple}
            showAiGenerator={!!onAiGenerate}
          />
        )}

        {isSourceMode ? (
          <div className="relative w-full h-[500px] 2xl:h-[600px] bg-[#2d2d2d] overflow-y-auto border-t border-border">
            <CodeEditor
              value={sourceCode}
              onValueChange={(code) => setSourceCode(code)}
              highlight={(code) =>
                Prism.highlight(code, Prism.languages.html || Prism.languages.markup, "html")
              }
              padding={16}
              textareaClassName="focus:outline-none"
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                fontSize: 14,
                minHeight: "100%",
                color: "#f8f8f2",
              }}
            />
          </div>
        ) : (
          <>
            <TableBubbleMenu editor={editor} />
            <div className="relative w-full max-h-[500px] 2xl:max-h-[600px] overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </>
        )}

        {toolbarPosition === "bottom" && (
          <Toolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            isFindReplaceOpen={isFindReplaceOpen}
            setIsFindReplaceOpen={setIsFindReplaceOpen}
            isShortcutsOpen={isShortcutsOpen}
            setIsShortcutsOpen={setIsShortcutsOpen}
            isAiGeneratorOpen={isAiGeneratorOpen}
            setIsAiGeneratorOpen={setIsAiGeneratorOpen}
            isSourceMode={isSourceMode}
            setIsSourceMode={toggleSourceMode}
            isSimple={isSimple}
            showAiGenerator={!!onAiGenerate}
          />
        )}

        {/* Word Count Status Bar */}
        {!isSimple && (
          <div className="border-t border-border px-4 py-2 bg-muted/20 text-xs text-muted-foreground flex items-center gap-4">
            <span>
              Words: <strong className="text-foreground">{editor.storage.characterCount?.words() || 0}</strong>
            </span>
            <span>
              Characters:{" "}
              <strong className="text-foreground">{editor.storage.characterCount?.characters() || 0}</strong>
            </span>
            <span>
              Reading time:{" "}
              <strong className="text-foreground">
                {Math.ceil((editor.storage.characterCount?.words() || 0) / 200)} min
              </strong>
            </span>
          </div>
        )}

        {isImageManagerOpen && (
          <ImageUploadDialog
            isOpen={isImageManagerOpen}
            onClose={() => setIsImageManagerOpen(false)}
            onSelect={handleImageSelect}
            onImageUpload={onImageUpload}
          />
        )}
      </div>

      {/* Find & Replace Modal */}
      <FindReplace
        editor={editor}
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        initialSearchTerm={selectedTextForSearch}
      />

      {/* Keyboard Shortcuts Modal */}
      {!isSimple && <KeyboardShortcuts isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />}

      {!isSimple && onAiGenerate && (
        <AiGenerator
          editor={editor}
          isOpen={isAiGeneratorOpen}
          onClose={() => setIsAiGeneratorOpen(false)}
          onGenerate={onAiGenerate}
        />
      )}
    </div>
  );
}
