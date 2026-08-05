import EditorPreview from "@/components/EditorPreview";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 overflow-hidden selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
              R
            </div>
            <span className="font-semibold text-lg tracking-tight">
              React Rich Editor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="https://github.com/hellomoksedul/react-rich-editor"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              v0.1.0 is now live
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-neutral-900 via-indigo-600 to-neutral-500 dark:from-white dark:via-indigo-100 dark:to-neutral-400">
            The modern rich text <br className="hidden md:block" />
            editor for React.
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A highly customizable, fully featured Tiptap-based WYSIWYG editor.
            Complete with resizable images, YouTube embeds, tables, dark mode,
            and a beautiful UI.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-3.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all shadow-lg shadow-indigo-500/25 active:scale-95">
              Get Started
            </button>
            <button className="px-8 py-3.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-900 dark:text-white font-medium border border-black/10 dark:border-white/10 transition-all active:scale-95">
              Read Documentation
            </button>
          </div>
        </section>

        {/* Editor Preview Section */}
        <section className="container mx-auto px-6 py-12 mb-32 max-w-5xl">
          <EditorPreview />
        </section>
      </div>
    </main>
  );
}
