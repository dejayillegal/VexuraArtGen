import { motion } from "framer-motion";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Palette,
  Upload,
  Shield,
  Zap,
  Image as ImageIcon,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display font-bold text-6xl md:text-7xl tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Create Stunning
              <br />
              AI-Generated Art
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
              Professional-grade digital art generator powered by OpenAI, Hugging
              Face, and Replicate. Create NFT-ready packages and sellable artwork
              with ease.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create" data-testid="button-create-now">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg">
                  <Sparkles className="w-5 h-5" />
                  Create Now
                </Button>
              </Link>
              <Link href="/gallery" data-testid="button-view-gallery">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 py-6 text-lg backdrop-blur-md"
                >
                  <ImageIcon className="w-5 h-5" />
                  View Gallery
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional tools and features designed for artists, creators, and
              NFT enthusiasts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="p-8 hover-elevate h-full" data-testid={`card-feature-${i}`}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-12 border border-primary/20"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Ready to Create?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start generating professional AI art in seconds
            </p>
            <Link href="/create" data-testid="button-start-creating">
              <Button size="lg" className="gap-2 px-8 py-6 text-lg">
                <Sparkles className="w-5 h-5" />
                Start Creating
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Vexura. Professional AI Art Generation Platform.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Sparkles,
    title: "Multi-Provider AI",
    description:
      "Access OpenAI DALL-E, Hugging Face Stable Diffusion, and Replicate models all in one place with automatic fallback support.",
  },
  {
    icon: Palette,
    title: "Style Transfer",
    description:
      "Upload reference images and apply their style to your generations with advanced image-to-image capabilities.",
  },
  {
    icon: Zap,
    title: "Batch Export",
    description:
      "Generate multiple sizes at once with metadata CSV and NFT-ready JSON packages for marketplaces.",
  },
  {
    icon: Upload,
    title: "IPFS Integration",
    description:
      "Upload your creations directly to IPFS via nft.storage for decentralized, permanent storage.",
  },
  {
    icon: Shield,
    title: "Commercial Ready",
    description:
      "Built-in licensing checklist and metadata templates ensure your art is ready for commercial use.",
  },
  {
    icon: ImageIcon,
    title: "Prompt Templates",
    description:
      "Six professionally crafted prompt presets for different art styles, from Abstract Neon to Cyberpunk Collage.",
  },
];
