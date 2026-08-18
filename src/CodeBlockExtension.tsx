"use client";

import CodeBlock from "@tiptap/extension-code-block";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

function CodeBlockView({ node, updateAttributes, editor }: NodeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = node.textContent.split("\n").length || 1;

  return (
    <NodeViewWrapper className="relative group my-6 rounded-xl bg-[#0d0d0d] text-[#e5e5e5] font-mono text-sm shadow-sm border border-[#2a2a2a] overflow-hidden">
      {/* Absolute positioned actions (top right) */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {editor.isEditable ? (
          <select
            contentEditable={false}
            className="bg-transparent text-[11px] font-medium text-muted-foreground hover:text-[#d4d4d4] outline-none cursor-pointer transition-colors px-2 py-1.5 rounded-md border border-[#2a2a2a] hover:bg-white/5"
            defaultValue={node.attrs.language || "text"}
            onChange={(e) => updateAttributes({ language: e.target.value })}
          >
            <option value="text">text</option>
            <option value="javascript">javascript</option>
            <option value="typescript">typescript</option>
            <option value="html">html</option>
            <option value="css">css</option>
            <option value="python">python</option>
            <option value="json">json</option>
            <option value="bash">bash</option>
          </select>
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground bg-transparent px-2 py-1.5 rounded-md border border-[#2a2a2a] select-none">
            {node.attrs.language || "text"}
          </span>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-transparent text-muted-foreground hover:text-white hover:bg-white/5 border border-[#2a2a2a] rounded-md"
          onClick={handleCopy}
          contentEditable={false}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Code Content with Line Numbers */}
      <div className="relative flex">
        {/* Line Numbers */}
        <div 
          className="flex flex-col select-none text-right pl-5 pr-4 py-5 text-[#666666] text-[13px] font-mono bg-transparent"
          contentEditable={false}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-[1.6] min-h-[1.3rem]">{i + 1}</div>
          ))}
        </div>
        
        {/* Actual Code */}
        <pre className="py-5 pr-28 pl-0 overflow-x-auto m-0 !bg-transparent flex-1 text-[13px] leading-[1.6] whitespace-pre">
          <NodeViewContent as={"code" as any} className="block outline-none min-h-[1.3rem]" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

export const CustomCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});
