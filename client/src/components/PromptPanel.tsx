import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { promptTemplates, type GenerateResponse, type Style } from "@shared/schema";
import { saveGeneration } from "@/lib/db";

interface PromptPanelProps {
  selectedStyle: Style | null;
  onGenerate: (result: GenerateResponse, prompt: string) => void;
  onGeneratingChange: (isGenerating: boolean) => void;
}

export function PromptPanel({ selectedStyle, onGenerate, onGeneratingChange }: PromptPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<"openai" | "hf" | "replicate" | "pollinations">("pollinations");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(30);
  const [guidanceScale, setGuidanceScale] = useState(7);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceStrength, setReferenceStrength] = useState(0.7);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/generate", data);
      return await response.json();
    },
    onSuccess: async (data: GenerateResponse) => {
      onGeneratingChange(false);
      onGenerate(data, prompt);

      // Save to IndexedDB - ensure meta exists
      if (data.meta) {
        const generation = {
          id: crypto.randomUUID(),
          prompt,
          provider: data.meta.provider as "openai" | "hf" | "replicate" | "pollinations",
          model: data.meta.model,
          imageDataUri: data.image,
          width: data.meta.width || width,
          height: data.meta.height || height,
          seed: data.meta.seed,
          initImage: selectedStyle?.dataUri,
          createdAt: new Date().toISOString(),
        };

        await saveGeneration(generation);
      }

      toast({
        title: "Generation Complete",
        description: "Your artwork has been created successfully.",
      });
    },
    onError: (error: any) => {
      onGeneratingChange(false);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const extractConceptsMutation = useMutation({
    mutationFn: async (imageDataUri: string) => {
      const response = await apiRequest("POST", "/api/extract_concepts", { imageDataUri });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setPrompt((prev) => {
        if (prev) return `${prev}, ${data.expandedPrompt}`;
        return data.expandedPrompt;
      });

      const details = [
        data.style && `Style: ${data.style}`,
        data.mood && `Mood: ${data.mood}`,
        data.lighting && `Lighting: ${data.lighting}`,
        data.keywords?.length && `${data.keywords.length} keywords extracted`,
      ].filter(Boolean).join(" • ");

      toast({
        title: "✨ Advanced Concepts Extracted",
        description: details || "Successfully analyzed style and added to prompt",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Concept Extraction Failed",
        description: error.message || "Unable to analyze image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }

    onGeneratingChange(true);
    generateMutation.mutate({
      prompt: prompt.trim(),
      provider,
      width,
      height,
      steps,
      guidanceScale,
      initImage: selectedStyle?.dataUri,
      referenceImage: referenceImage || undefined,
      referenceStrength: referenceStrength,
    });
  };

  const handleExtractConcepts = () => {
    if (!selectedStyle) {
      toast({
        title: "No Style Selected",
        description: "Please select a style image first.",
        variant: "destructive",
      });
      return;
    }
    extractConceptsMutation.mutate(selectedStyle.dataUri);
  };

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
      toast({
        title: "Reference Image Uploaded",
        description: "The AI will generate variations based on this image.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReference = () => {
    setReferenceImage(null);
    toast({
      title: "Reference Removed",
      description: "Generation will proceed without reference image.",
    });
  };

  const applyTemplate = (template: string) => {
    setPrompt(template);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl mb-2">Create Artwork</h2>
        <p className="text-sm text-muted-foreground">
          Enter your prompt and configure generation settings
        </p>
      </div>

      {/* Prompt Templates */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Prompt Presets</Label>
        <div className="flex flex-wrap gap-2">
          {promptTemplates.map((template) => (
            <Badge
              key={template.id}
              variant="outline"
              className="cursor-pointer hover-elevate active-elevate-2"
              onClick={() => applyTemplate(template.template)}
              data-testid={`badge-template-${template.id}`}
            >
              {template.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt">Prompt</Label>
          <span className="text-xs text-muted-foreground">
            {prompt.length}/2000
          </span>
        </div>
        <Textarea
          id="prompt"
          data-testid="input-prompt"
          placeholder="Describe the artwork you want to create..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-32 resize-none"
          maxLength={2000}
        />
      </div>

      {/* Reference Image Upload */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Reference Image (Optional)</Label>
          {referenceImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveReference}
              className="h-7 text-xs"
            >
              Remove
            </Button>
          )}
        </div>
        
        {referenceImage ? (
          <div className="space-y-3">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
              <img 
                src={referenceImage} 
                alt="Reference" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Reference Strength</Label>
                <span className="text-xs text-muted-foreground">{referenceStrength.toFixed(2)}</span>
              </div>
              <Slider
                value={[referenceStrength]}
                onValueChange={(v) => setReferenceStrength(v[0])}
                min={0.3}
                max={0.95}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower = more creative variation • Higher = closer to reference
              </p>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              id="reference-upload"
              accept="image/*"
              className="hidden"
              onChange={handleReferenceImageUpload}
            />
            <label htmlFor="reference-upload">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full gap-2"
                onClick={() => document.getElementById('reference-upload')?.click()}
              >
                <Upload className="w-4 h-4" />
                Upload Reference Image
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Upload an image to generate similar but creatively unique variations
            </p>
          </div>
        )}
      </Card>

      {/* Concept Extraction */}
      {selectedStyle && (
        <Button
          onClick={handleExtractConcepts}
          disabled={extractConceptsMutation.isPending}
          variant="outline"
          size="lg"
          className="w-full gap-2"
          data-testid="button-extract-concepts"
        >
          <Wand2 className="w-4 h-4" />
          {extractConceptsMutation.isPending ? "Extracting..." : "Extract Concepts from Style (FREE)"}
        </Button>
      )}
      {selectedStyle && (
        <p className="text-xs text-muted-foreground mt-1">
          Automatically generates professional prompt keywords from your style image - no API key required!
        </p>
      )}


      {/* Provider Selection */}
      <div className="space-y-2">
        <Label htmlFor="provider">AI Provider</Label>
        <Select value={provider} onValueChange={(v) => setProvider(v as any)}>
              <SelectTrigger id="provider" data-testid="select-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pollinations">Pollinations.ai (Flux) - 100% FREE ✓ No API Key</SelectItem>
                <SelectItem value="replicate">Replicate (Stable Diffusion) - FREE with API Key</SelectItem>
                <SelectItem value="openai">OpenAI (DALL-E 3) - Paid Only</SelectItem>
              </SelectContent>
            </Select>
        <p className="text-xs text-muted-foreground">
          {provider === "pollinations" && "Pollinations.ai is completely free with no API key required!"}
          {provider === "replicate" && (
            <>
              Replicate offers free API usage. Get your free API token at{' '}
              <a href="https://replicate.com" target="_blank" rel="noopener noreferrer" className="underline">
                replicate.com
              </a>
            </>
          )}
          {provider === "openai" && "OpenAI requires a paid API key"}
        </p>
      </div>

      {/* Advanced Settings */}
      <Accordion type="single" collapsible className="border rounded-lg">
        <AccordionItem value="advanced" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="text-sm font-medium">Advanced Settings</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            {/* Size Selection */}
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { w: 512, h: 512, label: "512×512" },
                  { w: 1024, h: 1024, label: "1024×1024" },
                  { w: 1024, h: 1792, label: "1024×1792" },
                  { w: 1792, h: 1024, label: "1792×1024" },
                ].map((size) => (
                  <Button
                    key={size.label}
                    variant={width === size.w && height === size.h ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setWidth(size.w);
                      setHeight(size.h);
                    }}
                    data-testid={`button-size-${size.label}`}
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Steps</Label>
                <span className="text-sm text-muted-foreground">{steps}</span>
              </div>
              <Slider
                value={[steps]}
                onValueChange={(v) => setSteps(v[0])}
                min={10}
                max={150}
                step={5}
                data-testid="slider-steps"
              />
            </div>

            {/* Guidance Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Guidance Scale</Label>
                <span className="text-sm text-muted-foreground">{guidanceScale}</span>
              </div>
              <Slider
                value={[guidanceScale]}
                onValueChange={(v) => setGuidanceScale(v[0])}
                min={1}
                max={20}
                step={0.5}
                data-testid="slider-guidance"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Generate Button */}
      <Button
        className="w-full gap-2 py-6"
        size="lg"
        onClick={handleGenerate}
        disabled={generateMutation.isPending}
        data-testid="button-generate"
      >
        <Sparkles className="w-5 h-5" />
        {generateMutation.isPending ? "Generating..." : "Generate Artwork"}
      </Button>
    </div>
  );
}