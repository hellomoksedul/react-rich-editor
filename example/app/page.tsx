import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import EditorPreview from "../components/EditorPreview";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center">
        <Hero />
        <EditorPreview />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
