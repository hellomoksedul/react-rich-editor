import Hero from "../components/Hero";
import Features from "../components/Features";
import EditorPreview from "../components/EditorPreview";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Hero />
      <EditorPreview />
      <Features />
      <footer className="py-12 text-center text-foreground/50 text-sm">
        Built with Next.js, Tailwind v4, and Tiptap.
      </footer>
    </main>
  );
}
