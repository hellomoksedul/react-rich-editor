import { EditorContent, useEditor } from "@tiptap/react";
import { getEditorExtensions } from "./extensions";
import { EditorDialog } from "./ui/editor-dialog";

export interface PreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
}

export function PreviewDialog({ isOpen, onClose, html }: PreviewDialogProps) {
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: html,
    editable: false,
    immediatelyRender: false,
  });

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Preview"
      className="w-[95vw] max-w-7xl"
    >
      <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-md border border-border bg-background p-6 shadow-inner hellokit-scrollbar">
        <div className="hellokit-editor-scope">
          <EditorContent editor={editor} />
        </div>
      </div>
    </EditorDialog>
  );
}
