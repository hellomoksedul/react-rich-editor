import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky max-w-7xl mx-auto top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold sm:inline-block">React Rich Editor</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {/* Links or Theme Toggle can go here */}
          </nav>
        </div>
      </div>
    </header>
  );
}
