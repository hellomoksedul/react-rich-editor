export default function Hero() {
  return (
    <section className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
        The Ultimate React Rich Text Editor
      </h1>
      <p className="text-lg md:text-xl text-foreground/70 mb-10">
        A full-featured Tiptap-based editor for modern React applications.
        Includes blocks for Charts, YouTube, Code, Equations, Columns, and built-in AI support.
      </p>
      <div className="flex gap-4 justify-center">
        <a href="#demo" className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition">
          Live Demo
        </a>
        <a href="https://github.com/hellomoksedul/react-rich-editor" target="_blank" className="px-6 py-3 bg-background text-foreground border border-foreground/10 font-medium rounded-lg hover:bg-foreground/5 transition">
          GitHub
        </a>
      </div>
    </section>
  );
}
