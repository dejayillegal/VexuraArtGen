import { Link } from "wouter";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sparkles, Image, Library } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-lg bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home" className="flex items-center hover-elevate active-elevate-2 rounded-lg px-2 py-1 -ml-2 cursor-pointer">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/create" data-testid="link-create">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Sparkles className="w-4 h-4" />
                Create
              </span>
            </Link>
            <Link href="/gallery" data-testid="link-gallery">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Library className="w-4 h-4" />
                Gallery
              </span>
            </Link>
          </nav>

          <Link href="/create" data-testid="button-get-started">
            <Button className="gap-2">
              <Image className="w-4 h-4" />
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}