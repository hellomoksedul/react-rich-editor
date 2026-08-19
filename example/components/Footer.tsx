export default function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10 py-8 bg-background">
      <div className="container max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Built by{" "}
          <a
            href="https://moksedul.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Moksedul
          </a>
          . The source code is available on{" "}
          <a
            href="https://github.com/hellomoksedul/react-rich-editor"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
