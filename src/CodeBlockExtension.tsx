"use client";

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { all, createLowlight } from "lowlight";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const lowlight = createLowlight(all);

const LANGUAGES = [
  { label: "TSX", value: "tsx" },
  { label: "TypeScript", value: "typescript" },
  { label: "JSX", value: "jsx" },
  { label: "JavaScript", value: "javascript" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Python", value: "python" },
  { label: "Bash", value: "bash" },
  { label: "SQL", value: "sql" },
  { label: "Markdown", value: "markdown" },
  { label: "YAML", value: "yaml" },
  { label: "Rust", value: "rust" },
  { label: "Go", value: "go" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "PHP", value: "php" },
  { label: "Plain Text", value: "text" },
];

function CodeBlockView({ node, updateAttributes, editor }: NodeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = node.textContent.split("\n").length || 1;
  const currentLang = node.attrs.language || "tsx";

  return (
    <NodeViewWrapper className="hellokit-code-block group">
      {/* Absolute positioned actions (top right) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 select-none">
        {editor.isEditable ? (
          <div contentEditable={false}>
            <Select
              value={currentLang}
              onValueChange={(value) => updateAttributes({ language: value })}
            >
              <SelectTrigger className="hellokit-code-btn h-7 min-w-18.5 text-[11px] font-medium outline-none cursor-pointer px-2.5 py-0 rounded-lg focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {LANGUAGES.map((lang) => (
                  <SelectItem
                    key={lang.value}
                    value={lang.value}
                    className="text-xs"
                  >
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <span className="hellokit-code-btn text-[11px] font-medium px-2.5 py-1 rounded-lg select-none">
            {LANGUAGES.find((l) => l.value === currentLang)?.label ||
              currentLang}
          </span>
        )}

        <button
          type="button"
          className="hellokit-code-btn h-7 w-7 flex items-center justify-center rounded-lg cursor-pointer"
          onClick={handleCopy}
          contentEditable={false}
          title="Copy code"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Code Content with Line Numbers */}
      <div className="relative flex min-w-0 w-full">
        {/* Line Numbers */}
        <div
          className="hellokit-code-line-numbers shrink-0"
          contentEditable={false}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6 min-h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Actual Code */}
        <pre className="m-0 min-w-0 flex-1 overflow-x-auto whitespace-pre leading-6">
          <NodeViewContent
            as={"code" as any}
            className="block outline-none min-h-6 leading-6"
          />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

export const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
}).configure({
  lowlight,
  defaultLanguage: "tsx",
});
