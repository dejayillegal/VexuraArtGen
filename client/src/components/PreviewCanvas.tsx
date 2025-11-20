import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Upload, Maximize2, Package, Sparkles } from "lucide-react";
import { BatchExportModal } from "./BatchExportModal";
import { IpfsUploadModal } from "./IpfsUploadModal";
import { ZoomModal } from "./ZoomModal";
import type { GenerateResponse } from "@shared/schema";

interface PreviewCanvasProps {
  generatedImage: GenerateResponse | null;
  isGenerating: boolean;
}

export function PreviewCanvas({ generatedImage, isGenerating }: PreviewCanvasProps) {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showIpfsModal, setShowIpfsModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);

  if (!generatedImage && !isGenerating) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-xl">Ready to Create</h3>
          <p className="text-muted-foreground">
            Enter a prompt and click Generate to start creating artwork
          </p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (!generatedImage?.image) return;

    try {
      // Ensure we have a valid data URI
      const dataUri = generatedImage.image.startsWith('data:')
        ? generatedImage.image
        : `data:image/png;base64,${generatedImage.image}`;

      const link = document.createElement("a");
      link.href = dataUri;
      link.download = `vexura-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Preview Area */}
        <Card className="aspect-square w-full max-w-2xl mx-auto overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="w-full h-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6 w-full max-w-sm"
                >
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Package className="w-12 h-12 text-primary" />
                      </motion.div>
                    </div>
                    <div className="absolute inset-0 blur-2xl bg-primary/30" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Generating Artwork</h3>
                    <p className="text-sm text-muted-foreground">
                      Creating your masterpiece...
                    </p>
                    <Progress value={undefined} className="w-full" />
                  </div>
                </motion.div>
              ) : generatedImage ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative"
                >
                  {generatedImage.image ? (
                    <img
                      src={generatedImage.image.startsWith('data:')
                        ? generatedImage.image
                        : `data:image/png;base64,${generatedImage.image}`
                      }
                      alt="Generated artwork"
                      className="w-full h-auto rounded-lg shadow-2xl border border-border/50"
                      data-testid="generated-image"
                      onError={(e) => {
                        console.error("Image failed to load:", e);
                        e.currentTarget.alt = "Failed to load image";
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">No image data</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">No Artwork Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Enter a prompt and click Generate to create your artwork
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Metadata & Actions */}
        {generatedImage && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Metadata */}
            {generatedImage.meta && (
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {generatedImage.meta?.provider && (
                    <Badge variant="outline" data-testid="badge-provider">
                      {generatedImage.meta.provider}
                    </Badge>
                  )}
                  {generatedImage.meta?.model && (
                    <Badge variant="outline" data-testid="badge-model">
                      {generatedImage.meta.model}
                    </Badge>
                  )}
                  {generatedImage.meta?.width && generatedImage.meta?.height && (
                    <Badge variant="outline" data-testid="badge-dimensions">
                      {generatedImage.meta.width}×{generatedImage.meta.height}
                    </Badge>
                  )}
                  {generatedImage.meta?.seed && (
                    <Badge variant="outline" data-testid="badge-seed">
                      Seed: {generatedImage.meta.seed}
                    </Badge>
                  )}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={handleDownload}
                data-testid="button-download"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={() => setShowZoomModal(true)}
                data-testid="button-zoom"
              >
                <Maximize2 className="w-4 h-4" />
                View Full
              </Button>
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={() => setShowBatchModal(true)}
                data-testid="button-batch-export"
              >
                <Package className="w-4 h-4" />
                Batch Export
              </Button>
              <Button
                className="gap-2 flex-1"
                onClick={() => setShowIpfsModal(true)}
                data-testid="button-upload-ipfs"
              >
                <Upload className="w-4 h-4" />
                Upload to IPFS
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <BatchExportModal open={showBatchModal} onOpenChange={setShowBatchModal} />
      <IpfsUploadModal
        open={showIpfsModal}
        onOpenChange={setShowIpfsModal}
        imageDataUri={generatedImage?.image}
      />
      <ZoomModal
        open={showZoomModal}
        onOpenChange={setShowZoomModal}
        imageDataUri={generatedImage?.image}
      />
    </div>
  );
}