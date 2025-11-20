import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { PromptPanel } from "@/components/PromptPanel";
import { PreviewCanvas } from "@/components/PreviewCanvas";
import { StylePalette } from "@/components/StylePalette";
import type { GenerateResponse, Style } from "@shared/schema";

export default function Create() {
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GenerateResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string>("");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16 h-screen flex">
        {/* Left Panel - Prompt Controls */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-80 border-r border-border overflow-y-auto"
        >
          <PromptPanel
            selectedStyle={selectedStyle}
            onGenerate={(result, prompt) => {
              setGeneratedImage(result);
              setLastPrompt(prompt);
              setIsGenerating(false);
            }}
            onGeneratingChange={setIsGenerating}
          />
        </motion.aside>

        {/* Center Panel - Preview Canvas */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 overflow-y-auto"
        >
          <PreviewCanvas
            generatedImage={generatedImage}
            isGenerating={isGenerating}
            lastPrompt={lastPrompt}
          />
        </motion.main>

        {/* Right Panel - Style Palette */}
        <motion.aside
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-96 border-l border-border overflow-y-auto"
        >
          <StylePalette
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
          />
        </motion.aside>
      </div>
    </div>
  );
}
