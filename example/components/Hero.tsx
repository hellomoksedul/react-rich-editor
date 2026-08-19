"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const installCmd = "npm install @hellokit/react-rich-editor";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-8 lg:py-16 px-6 text-center max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
        The Ultimate React Rich Text Editor
      </h1>
      <p className="text-lg md:text-xl text-foreground/70 mb-10">
        A full-featured Tiptap-based editor for modern React applications.
        Includes blocks for Charts, YouTube, Code, Equations, Columns, and
        built-in AI support.
      </p>

      {/* Install command copy system */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-lg pl-4 pr-2 py-2 w-full max-w-md">
          <span className="text-foreground/40 select-none">$</span>
          <code className="text-sm font-mono text-foreground/80 flex-1 text-left overflow-x-auto whitespace-nowrap hide-scrollbar">
            {installCmd}
          </code>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-foreground/10 rounded-md transition-colors shrink-0"
            aria-label="Copy install command"
            title="Copy"
          >
            {copied ? (
              <FiCheck className="text-green-500 w-4 h-4" />
            ) : (
              <FiCopy className="text-foreground/60 w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <a
          href="https://www.npmjs.com/package/@hellokit/react-rich-editor"
          target="_blank"
          className="px-6 py-2.5 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition shadow-lg shadow-foreground/20"
        >
          Get Started
        </a>

        <a
          href="https://github.com/hellomoksedul/react-rich-editor"
          target="_blank"
          className="px-6 py-2.5 bg-background text-foreground border border-foreground/10 font-medium rounded-lg hover:bg-foreground/5 transition"
        >
          Source Code
        </a>
      </div>
    </section>
  );
}
