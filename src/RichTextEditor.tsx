import { EditorContent, useEditor } from "@tiptap/react";
import { Loader2 } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { useEffect, useRef, useState } from "react";
import CodeEditor from "react-simple-code-editor";
import {
  AskAiDialog,
  DEFAULT_AI_PROVIDERS,
  type AiCreditsInfo,
  type AiProviderConfig,
} from "./AskAiDialog";
import { ButtonBlockMenu } from "./ButtonBlockMenu";
import { getEditorExtensions, type TocItem } from "./extensions";
import { LayoutMenu } from "./LayoutMenu";
import { FileUploadDialog } from "./FileUploadDialog";
import { FindReplace } from "./FindReplace";
import { ImageUploadDialog } from "./ImageUploadDialog";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { type MediaItem, resolveImageUpload } from "./lib/image-upload";
import { PreviewDialog } from "./PreviewDialog";
import { SignatureDialog } from "./SignatureDialog";
import { StyleInjector } from "./StyleInjector";
import { TableBubbleMenu } from "./TableBubbleMenu";
import { Toolbar } from "./Toolbar";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  isSimple?: boolean;
  toolbarPosition?: "top" | "bottom";
  onImageUpload?: (file: File) => Promise<string>;
  onListMedia?: () => Promise<MediaItem[]>;
  /** @deprecated Use `onAskAi` instead — kept working for existing
   * integrations. Ignored if `onAskAi` is also provided. */
  onAiGenerate?: (prompt: string) => Promise<string>;
  /** Upload a picked/dropped file (any type) for the "Upload File" block.
   * Without it, files are embedded as base64 data URLs — fine for small
   * files, but a real backend is recommended for anything larger. */
  onFileUpload?: (file: File) => Promise<string>;
  /** Providers listed in the "Ask AI" toolbar dialog's provider picker.
   * Defaults to four common providers (OpenAI/Anthropic/xAI/Google) — pass
   * your own list to match whichever providers your backend supports. */
  aiProviders?: AiProviderConfig[];
  /** Called when the user submits a prompt from the "Ask AI" dialog. Must
   * resolve to raw HTML (h1, h2, p, ul, ol, strong, em, ...) suitable for
   * insertion into the editor — call your own backend here, never an AI
   * provider directly from the client with a real API key. The "Ask AI"
   * toolbar button is always shown; without this prop the dialog still
   * opens but shows a reminder to wire it up instead of failing silently. */
  onAskAi?: (params: { prompt: string; provider: AiProviderConfig }) => Promise<string>;
  /** Optional credits/usage summary shown in the "Ask AI" dialog. Omit to hide that panel. */
  aiCredits?: AiCreditsInfo;
  /** Called when "Top up" is clicked in the "Ask AI" credits panel. Omit to hide the link. */
  onTopUpCredits?: () => void;
  /** localStorage key used to remember recent "Ask AI" prompts on this device. */
  aiRecentPromptsStorageKey?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing...",
  className,
  isSimple = false,
  toolbarPosition = "top",
  onImageUpload,
  onListMedia,
  onAiGenerate,
  onFileUpload,
  aiProviders,
  onAskAi,
  aiCredits,
  onTopUpCredits,
  aiRecentPromptsStorageKey,
}: RichTextEditorProps) {
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTextForSearch, setSelectedTextForSearch] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Kept fresh via effect below so the drop/paste handlers below (captured
  // once by useEditor) always call the latest onImageUpload prop.
  const onImageUploadRef = useRef(onImageUpload);
  useEffect(() => {
    onImageUploadRef.current = onImageUpload;
  }, [onImageUpload]);

  const insertImagesAt = (
    view: import("@tiptap/pm/view").EditorView,
    files: File[],
    startPos: number,
  ) => {
    let pos = startPos;
    void (async () => {
      for (const file of files) {
        try {
          const url = await resolveImageUpload(file, onImageUploadRef.current);
          const node = view.state.schema.nodes.image.create({ src: url });
          view.dispatch(view.state.tr.insert(pos, node));
          pos += node.nodeSize;
        } catch {
          // Skip files that fail to upload; continue with the rest.
        }
      }
    })();
  };

  const lastUpdatedValue = useRef(value);

  const editor = useEditor({
    extensions: getEditorExtensions(placeholder, {
      onImageCommand: () => setIsImageManagerOpen(true),
      onFileCommand: () => setIsFileManagerOpen(true),
      onSignatureCommand: () => setIsSignatureOpen(true),
      onTocUpdate: (items) => setTocItems(items),
    }),
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `focus:outline-none ${isSimple ? "simple-mode" : ""}`,
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const allFiles = Array.from(event.dataTransfer?.files ?? []);
        const files = allFiles.filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) {
          // Non-image files (PDFs, docs, video, ...) aren't supported yet —
          // block the browser's default handling (which otherwise tends to
          // navigate the tab to the dropped file) instead of silently doing
          // nothing that also lets the browser do something worse.
          if (allFiles.length > 0) event.preventDefault();
          return false;
        }
        event.preventDefault();
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;
        insertImagesAt(view, files, pos);
        return true;
      },
      handlePaste: (view, event) => {
        // Unlike drop, a plain paste can't navigate the tab away, so a
        // non-image file here is left to ProseMirror's normal paste
        // handling (returning false) rather than pre-empted.
        const files = Array.from(event.clipboardData?.files ?? []).filter(
          (f) => f.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        insertImagesAt(view, files, view.state.selection.from);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastUpdatedValue.current = html;
      onChange?.(html);
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== undefined) {
      if (value === lastUpdatedValue.current || value === editor.getHTML()) {
        return;
      }
      editor.commands.setContent(value, { emitUpdate: false });
      lastUpdatedValue.current = value;
    }
  }, [value, editor]);

  // Chrome/Edge (and some other Blink/WebKit browsers) draw their own native
  // resize handles + selection outline around <img>/<table> elements inside
  // a contenteditable region. That native box is what shows up as the extra
  // outer border around images/tables — separate from (and larger than) our
  // custom ResizableImage selection frame. Disabling it here so only our own
  // handles are visible.
  useEffect(() => {
    if (!editor) return;
    try {
      document.execCommand("enableObjectResizing", false, false as any);
      document.execCommand("enableInlineTableEditing", false, false as any);
    } catch {
      // Deprecated API, unsupported (or throws) in some browsers — safe to ignore.
    }
  }, [editor]);

  // Handle Ctrl+F (Find & Replace), Ctrl+K (Insert Link) and Ctrl+Shift+H
  // (Horizontal Rule) keyboard shortcuts. These are exactly the shortcuts
  // advertised in the KeyboardShortcuts modal — Ctrl+K and Ctrl+Shift+H used
  // to be listed there but weren't wired up anywhere (neither the Link nor
  // the HorizontalRule Tiptap extensions ship a default keybinding for them),
  // so they silently did nothing.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();

        // Get selected text if any
        if (editor) {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to);
          setSelectedTextForSearch(selectedText);
        }

        setIsFindReplaceOpen(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsLinkPopoverOpen(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        editor?.chain().focus().setHorizontalRule().run();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  const handleTocNavigate = (item: TocItem) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(item.pos).run();
    item.dom?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleImageUpload = () => {
    setIsImageManagerOpen(true);
  };

  const handleImageSelect = (url: string) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleFileSelect = (attrs: { url: string; name: string; size: number }) => {
    editor?.chain().focus().setFileAttachment(attrs).run();
  };

  const handleSignatureSave = (dataUrl: string) => {
    editor?.chain().focus().setImage({ src: dataUrl }).run();
    setIsSignatureOpen(false);
  };

  // `onAskAi` (multi-provider) supersedes the legacy single-callback
  // `onAiGenerate` — if only the legacy prop is wired up, adapt it so the
  // "Ask AI" dialog still works (ignoring whichever provider is picked,
  // since there's only ever the one).
  const effectiveAskAi =
    onAskAi ?? (onAiGenerate ? ({ prompt }: { prompt: string; provider: AiProviderConfig }) => onAiGenerate(prompt) : undefined);

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
      <div className="flex h-100 items-center justify-center border border-border rounded-md">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 hellokit-editor-scope">
      <StyleInjector />
      <div
        className={
          className
            ? className
            : "bg-background text-foreground border border-border rounded-md overflow-hidden"
        }
      >
        {toolbarPosition === "top" && (
          <Toolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            onFileUpload={() => setIsFileManagerOpen(true)}
            onSignature={() => setIsSignatureOpen(true)}
            isFindReplaceOpen={isFindReplaceOpen}
            setIsFindReplaceOpen={setIsFindReplaceOpen}
            isShortcutsOpen={isShortcutsOpen}
            setIsShortcutsOpen={setIsShortcutsOpen}
            isAskAiOpen={isAskAiOpen}
            setIsAskAiOpen={setIsAskAiOpen}
            isLinkPopoverOpen={isLinkPopoverOpen}
            setIsLinkPopoverOpen={setIsLinkPopoverOpen}
            isSourceMode={isSourceMode}
            setIsSourceMode={toggleSourceMode}
            isPreviewOpen={isPreviewOpen}
            setIsPreviewOpen={setIsPreviewOpen}
            isSimple={isSimple}
            tocItems={tocItems}
            onTocNavigate={handleTocNavigate}
          />
        )}

        {isSourceMode ? (
          <div className="relative w-full min-h-125 max-h-200 bg-[#2d2d2d] overflow-y-auto border-t border-border">
            <CodeEditor
              value={sourceCode}
              onValueChange={(code) => setSourceCode(code)}
              highlight={(code) =>
                Prism.highlight(
                  code,
                  Prism.languages.html || Prism.languages.markup,
                  "html",
                )
              }
              padding={16}
              textareaClassName="focus:outline-none"
              style={{
                fontFamily:
                  '"Fira Code", "JetBrains Mono", Consolas, monospace',
                fontSize: 14,
                minHeight: "100%",
                color: "#f8f8f2",
              }}
            />
          </div>
        ) : (
          <>
            <TableBubbleMenu editor={editor} />
            <ButtonBlockMenu editor={editor} />
            <LayoutMenu editor={editor} />
            <div className="relative w-full min-h-125 max-h-200 overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </>
        )}

        {toolbarPosition === "bottom" && (
          <Toolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            onFileUpload={() => setIsFileManagerOpen(true)}
            onSignature={() => setIsSignatureOpen(true)}
            isFindReplaceOpen={isFindReplaceOpen}
            setIsFindReplaceOpen={setIsFindReplaceOpen}
            isShortcutsOpen={isShortcutsOpen}
            setIsShortcutsOpen={setIsShortcutsOpen}
            isAskAiOpen={isAskAiOpen}
            setIsAskAiOpen={setIsAskAiOpen}
            isLinkPopoverOpen={isLinkPopoverOpen}
            setIsLinkPopoverOpen={setIsLinkPopoverOpen}
            isSourceMode={isSourceMode}
            setIsSourceMode={toggleSourceMode}
            isPreviewOpen={isPreviewOpen}
            setIsPreviewOpen={setIsPreviewOpen}
            isSimple={isSimple}
            tocItems={tocItems}
            onTocNavigate={handleTocNavigate}
          />
        )}

        {/* Word Count Status Bar */}
        {!isSimple && (
          <div className="border-t border-border px-4 py-2 bg-muted/20 text-xs text-muted-foreground flex items-center gap-4">
            <span>
              Words:{" "}
              <strong className="text-foreground">
                {editor.storage.characterCount?.words() || 0}
              </strong>
            </span>
            <span>
              Characters:{" "}
              <strong className="text-foreground">
                {editor.storage.characterCount?.characters() || 0}
              </strong>
            </span>
            <span>
              Reading time:{" "}
              <strong className="text-foreground">
                {Math.ceil((editor.storage.characterCount?.words() || 0) / 200)}{" "}
                min
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
            onListMedia={onListMedia}
          />
        )}

        {isFileManagerOpen && (
          <FileUploadDialog
            isOpen={isFileManagerOpen}
            onClose={() => setIsFileManagerOpen(false)}
            onSelect={handleFileSelect}
            onFileUpload={onFileUpload}
          />
        )}

        {isSignatureOpen && (
          <SignatureDialog
            isOpen={isSignatureOpen}
            onClose={() => setIsSignatureOpen(false)}
            onSave={handleSignatureSave}
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
      {!isSimple && (
        <KeyboardShortcuts
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />
      )}

      {!isSimple && (
        <AskAiDialog
          editor={editor}
          isOpen={isAskAiOpen}
          onClose={() => setIsAskAiOpen(false)}
          providers={aiProviders ?? DEFAULT_AI_PROVIDERS}
          onAskAi={effectiveAskAi}
          credits={aiCredits}
          onTopUpCredits={onTopUpCredits}
          recentPromptsStorageKey={aiRecentPromptsStorageKey}
        />
      )}

      {isPreviewOpen && (
        <PreviewDialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          html={editor.getHTML()}
        />
      )}
    </div>
  );
}
