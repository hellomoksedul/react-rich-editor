export default function Features() {
  const features = [
    {
      title: "Slash Commands",
      desc: "Type / to quickly insert blocks without leaving the keyboard.",
    },
    {
      title: "React Node Views",
      desc: "Interactive blocks like Recharts, equations, and multi-column layouts.",
    },
    {
      title: "AI Ready",
      desc: "Built-in hooks for text generation and image generation.",
    },
    {
      title: "Tailwind Native",
      desc: "Inherits your app's colors and fonts effortlessly.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 tracking-tight text-foreground">
          Everything you need out of the box
        </h2>
        {/* Unified "Single System" grid using gap-px to create borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden gap-px shadow-xl shadow-black/5 dark:shadow-white/5">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-8 bg-background flex flex-col justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-300"
            >
              <h3 className="font-semibold text-lg mb-3 text-foreground">
                {f.title}
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
