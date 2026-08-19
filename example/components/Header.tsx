"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { FaGithub, FaMoon, FaSun } from "react-icons/fa";

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-background/95 backdrop-blur">
      <div className="container flex h-14 max-w-6xl mx-auto items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold sm:inline-block">
              @hellokit/react-rich-editor
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-foreground/70 hover:text-foreground"
              aria-label="Toggle theme"
            >
              <FaSun className="h-4 w-4 block dark:hidden" />
              <FaMoon className="h-4 w-4 hidden dark:block" />
            </button>
            <a
              href="https://github.com/hellomoksedul/react-rich-editor"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-foreground/70 hover:text-foreground"
            >
              <FaGithub className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
