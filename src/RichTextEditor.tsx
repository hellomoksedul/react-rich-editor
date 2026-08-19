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
  type AskAiHandler,
} from "./AskAiDialog";
import { ButtonBlockMenu } from "./ButtonBlockMenu";
import { getEditorExtensions, type TocItem } from "./extensions";
import { FileUploadDialog } from "./FileUploadDialog";
import { FindReplace } from "./FindReplace";
import { ImageUploadDialog } from "./ImageUploadDialog";
import { InlineBubbleMenu } from "./InlineBubbleMenu";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { LayoutMenu } from "./LayoutMenu";
import { resolveImageUpload, type MediaItem } from "./lib/image-upload";
import { PreviewDialog } from "./PreviewDialog";
import { SignatureDialog } from "./SignatureDialog";
import { StyleInjector } from "./StyleInjector";
import { TableBubbleMenu } from "./TableBubbleMenu";
import { GenerateImageDialog } from "./GenerateImageDialog";
import { TranslateDialog } from "./TranslateDialog";
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
  /** Async callback that should route the prompt to an AI backend and return the generated HTML. */
  onAskAi?: AskAiHandler;
  /** Optional credits/usage summary shown in the "Ask AI" dialog. Omit to hide that panel. */
  aiCredits?: AiCreditsInfo;
  onTopUpCredits?: () => void;
  aiRecentPromptsStorageKey?: string;
  onGenerateImage?: (prompt: string, options?: { aspectRatio?: string }) => Promise<string>;
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
  onGenerateImage,
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
  const [isGenerateImageOpen, setIsGenerateImageOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [selectedTextForSearch, setSelectedTextForSearch] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  const handleInlineAiAction = async (action: string) => {
    if (action === "generate_image") {
      setIsGenerateImageOpen(true);
      return;
    }
    if (action === "translate") {
      setIsTranslateOpen(true);
      return;
    }

    if (!editor) return;

    const { from, to, empty } = editor.state.selection;
    if (empty) {
      alert("Please select some text first to use inline AI tools.");
      return;
    }
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!effectiveAskAi) {
      alert("Please configure the onAskAi prop to use inline AI tools.");
      return;
    }

    const { DOMSerializer } = await import("@tiptap/pm/model");
    const slice = editor.state.selection.content();
    const serializer = DOMSerializer.fromSchema(editor.schema);
    const frag = serializer.serializeFragment(slice.content);
    const tmp = document.createElement("div");
    tmp.appendChild(frag);
    const selectedHtml = tmp.innerHTML;

    const actionPrompts: Record<string, string> = {
      fix_grammar: "Fix the grammar of the following text. IMPORTANT: Output ONLY the corrected text. Do NOT wrap the output in any HTML tags (like <p> or <h1>) unless the original text contained them. Preserve existing HTML perfectly.",
      simplify: "Simplify the following text. IMPORTANT: Output ONLY the simplified text. Do NOT wrap the output in any HTML tags (like <p> or <h1>) unless the original text contained them. Preserve existing HTML perfectly.",
      complete_sentence: "Complete the following sentence naturally. IMPORTANT: Output ONLY the completed text. Do NOT wrap the output in any HTML tags (like <p>).",
      make_longer: "Expand on the following text and make it longer. IMPORTANT: Output ONLY the expanded text. Do NOT wrap the output in any HTML tags (like <p> or <h1>) unless the original text contained them. Preserve existing HTML perfectly.",
      make_shorter: "Summarize or make the following text shorter. IMPORTANT: Output ONLY the shorter text. Do NOT wrap the output in any HTML tags (like <p> or <h1>) unless the original text contained them. Preserve existing HTML perfectly.",
    };

    const instruction = actionPrompts[action] || "Improve this text. Preserve existing HTML tags and do not wrap in <p> unless the input contains it:";
    const prompt = `${instruction}\n\n${selectedHtml || selectedText}`;
    
    // Default to the first available provider
    const provider = aiProviders?.[0] || DEFAULT_AI_PROVIDERS[0];

    try {
      const originalSelection = editor.state.selection;
      let currentEnd = originalSelection.to;
      let accumulatedHTML = "";
      let hasStartedStreaming = false;
      
      // Apply the pulsing decoration to the selected text
      editor.view.dispatch(editor.state.tr.setMeta("aiLoading", { isLoading: true, from: originalSelection.from, to: originalSelection.to }));

      const resultHTML = await effectiveAskAi({ 
        prompt, 
        provider,
        onStream: (chunk) => {
          if (!hasStartedStreaming) {
             editor.view.dispatch(editor.state.tr.setMeta("aiLoading", { isLoading: false, from: 0, to: 0 }));
             hasStartedStreaming = true;
          }
          accumulatedHTML += chunk;
          // Delete from start to currentEnd, and insert accumulated text
          editor.chain().focus()
            .setTextSelection({ from: originalSelection.from, to: currentEnd })
            .insertContent(accumulatedHTML)
            .run();
            
          // Update currentEnd to the new selection end (which is right after the inserted content)
          currentEnd = editor.state.selection.to;
        }
      });
      
      // Final replacement just to be sure (if streaming wasn't used or to set final sanitized HTML)
      editor.chain().focus().setTextSelection({ from: originalSelection.from, to: currentEnd }).insertContent(resultHTML).run();
    } catch (error: any) {
      alert(error?.message || "AI request failed.");
    } finally {
      editor.view.dispatch(editor.state.tr.setMeta("aiLoading", { isLoading: false, from: 0, to: 0 }));
    }
  };

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
      onTocUpdate: (items) => setTimeout(() => setTocItems(items), 0),
      onGenerateImage: onGenerateImage,
      onImageUpload,
    }),
    content: value,
    immediatelyRender: true,
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
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/"),
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
      // Defer the external onChange call to prevent "Cannot update a component while rendering a different component"
      // or "component hasn't mounted yet" errors in React 19 when Tiptap normalizes content on first render.
      setTimeout(() => {
        onChange?.(html);
      }, 0);
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
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        e.key.toLowerCase() === "f"
      ) {
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

      if (
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setIsLinkPopoverOpen(true);
        return;
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "h"
      ) {
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

  const handleFileSelect = (attrs: {
    url: string;
    name: string;
    size: number;
  }) => {
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
    onAskAi ??
    (onAiGenerate
      ? ({ prompt }: { prompt: string; provider: AiProviderConfig }) =>
          onAiGenerate(prompt)
      : undefined);

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
          className ||
          "hellokit-editor-container relative flex flex-col w-full border border-input rounded-md overflow-hidden bg-background focus-within:outline-none"
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
            onInlineAiAction={handleInlineAiAction}
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
            <InlineBubbleMenu editor={editor} onInlineAiAction={handleInlineAiAction} />
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
            onInlineAiAction={handleInlineAiAction}
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

      {!isSimple && (
        <GenerateImageDialog
          editor={editor}
          isOpen={isGenerateImageOpen}
          onClose={() => setIsGenerateImageOpen(false)}
          onGenerate={onGenerateImage}
          onImageUpload={onImageUpload}
        />
      )}

      {!isSimple && (
        <TranslateDialog
          editor={editor}
          isOpen={isTranslateOpen}
          onClose={() => setIsTranslateOpen(false)}
          onTranslate={async (language, selectedText, onStream) => {
             const prompt = `Translate the following text to ${language}. IMPORTANT: Output ONLY the translated text. Do NOT wrap the output in any HTML tags (like <p> or <h1>) unless the original text contained them. Preserve existing HTML perfectly:\n\n${selectedText}`;
             const provider = aiProviders?.[0] || DEFAULT_AI_PROVIDERS[0];
             if (!effectiveAskAi) throw new Error("onAskAi not configured");
             return effectiveAskAi({ prompt, provider, onStream });
          }}
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
