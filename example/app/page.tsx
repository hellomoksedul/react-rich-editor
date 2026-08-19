import EditorPreview from "@/components/EditorPreview";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center">
        <Hero />
        <EditorPreview />
      </main>
      <Footer />
    </div>
  );
}
