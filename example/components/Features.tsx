export default function Features() {
  const features = [
    { title: "Slash Commands", desc: "Type / to quickly insert blocks without leaving the keyboard." },
    { title: "React Node Views", desc: "Interactive blocks like Recharts, equations, and multi-column layouts." },
    { title: "AI Ready", desc: "Built-in hooks for text generation and image generation." },
    { title: "Tailwind Native", desc: "Inherits your app's colors and fonts effortlessly." },
  ];

  return (
    <section className="py-20 px-6 bg-foreground/[0.02] border-t border-b border-foreground/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need out of the box</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-background rounded-2xl border border-foreground/5 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
