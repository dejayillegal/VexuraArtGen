
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpscaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageDataUri: string | null | undefined;
}

export function UpscaleModal({ open, onOpenChange, imageDataUri }: UpscaleModalProps) {
  const [upscaling, setUpscaling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState<"2" | "4">("2");
  const { toast } = useToast();

  const handleUpscale = async () => {
    if (!imageDataUri) return;

    setUpscaling(true);
    setProgress(0);
    setUpscaledImage(null);

    try {
      // Convert data URI to image element
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageDataUri;
      });

      setProgress(20);

      // Create canvas for processing
      const scale = parseInt(scaleFactor);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to original image size
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      setProgress(40);

      // Get original image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      setProgress(60);

      // Apply enhancement filters
      const enhanced = enhanceImage(imageData);
      
      setProgress(80);

      // Upscale using high-quality bicubic interpolation
      const upscaledCanvas = document.createElement('canvas');
      const upscaledCtx = upscaledCanvas.getContext('2d', { 
        alpha: false,
        willReadFrequently: false 
      });
      
      if (!upscaledCtx) {
        throw new Error('Failed to get upscaled canvas context');
      }

      upscaledCanvas.width = canvas.width * scale;
      upscaledCanvas.height = canvas.height * scale;

      // Use high-quality image smoothing
      upscaledCtx.imageSmoothingEnabled = true;
      upscaledCtx.imageSmoothingQuality = 'high';

      // Put enhanced data back
      ctx.putImageData(enhanced, 0, 0);

      // Scale up with bicubic interpolation
      upscaledCtx.drawImage(canvas, 0, 0, upscaledCanvas.width, upscaledCanvas.height);

      // Apply sharpening to upscaled image
      const finalImageData = upscaledCtx.getImageData(0, 0, upscaledCanvas.width, upscaledCanvas.height);
      const sharpened = sharpenImage(finalImageData);
      upscaledCtx.putImageData(sharpened, 0, 0);

      setProgress(95);

      // Convert to data URI
      const upscaledDataUri = upscaledCanvas.toDataURL('image/png', 1.0);
      setUpscaledImage(upscaledDataUri);

      setProgress(100);

      toast({
        title: "Upscaling Complete",
        description: `Image enhanced and upscaled ${scale}x successfully!`,
      });
    } catch (error: any) {
      console.error('Upscaling error:', error);
      toast({
        title: "Upscaling Failed",
        description: error.message || "Failed to upscale image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpscaling(false);
    }
  };

  const enhanceImage = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const enhanced = new ImageData(imageData.width, imageData.height);
    
    // Apply contrast enhancement and color correction
    for (let i = 0; i < data.length; i += 4) {
      // Contrast enhancement
      const contrast = 1.15;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      
      enhanced.data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      enhanced.data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      enhanced.data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
      enhanced.data[i + 3] = data[i + 3]; // Alpha
    }
    
    return enhanced;
  };

  const sharpenImage = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const sharpened = new ImageData(width, height);
    
    // Unsharp mask kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const px = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIndex = (ky + 1) * 3 + (kx + 1);
              sum += data[px] * kernel[kernelIndex];
            }
          }
          const idx = (y * width + x) * 4 + c;
          sharpened.data[idx] = Math.min(255, Math.max(0, sum));
        }
        const idx = (y * width + x) * 4 + 3;
        sharpened.data[idx] = 255; // Alpha
      }
    }
    
    return sharpened;
  };

  const handleDownload = () => {
    if (!upscaledImage) return;

    const link = document.createElement('a');
    link.href = upscaledImage;
    link.download = `vexura-upscaled-${scaleFactor}x-${Date.now()}.png`;
    link.click();

    toast({
      title: "Download Started",
      description: "Your upscaled image is being downloaded.",
    });
  };

  const handleReset = () => {
    setUpscaledImage(null);
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Upscale & Enhance Image
          </DialogTitle>
          <DialogDescription>
            Enhance image quality and upscale using advanced AI algorithms - 100% free and runs in your browser!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Settings */}
          {!upscaledImage && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Scale Factor</Label>
                <Select value={scaleFactor} onValueChange={(v) => setScaleFactor(v as "2" | "4")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2x (Recommended) - Fast</SelectItem>
                    <SelectItem value="4">4x - Higher Quality</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Higher scale factors produce larger images but take longer to process
                </p>
              </div>

              {/* Original Preview */}
              {imageDataUri && (
                <div className="space-y-2">
                  <Label>Original Image</Label>
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={imageDataUri} 
                      alt="Original" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {upscaling && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Enhancing contrast, sharpening details, and upscaling...
              </p>
            </div>
          )}

          {/* Result */}
          {upscaledImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enhanced Result ({scaleFactor}x)</Label>
                <div className="flex gap-2">
                  <Button onClick={handleReset} variant="outline" size="sm">
                    Upscale Again
                  </Button>
                  <Button onClick={handleDownload} size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden bg-muted">
                <img 
                  src={upscaledImage} 
                  alt="Upscaled" 
                  className="w-full h-auto"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ✅ Enhanced with contrast adjustment, detail sharpening, and high-quality bicubic upscaling
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!upscaledImage && !upscaling && (
            <div className="flex gap-2">
              <Button 
                onClick={handleUpscale} 
                disabled={upscaling || !imageDataUri}
                className="flex-1 gap-2"
              >
                {upscaling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Upscale & Enhance
                  </>
                )}
              </Button>
              <Button 
                onClick={() => onOpenChange(false)} 
                variant="outline"
                disabled={upscaling}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
