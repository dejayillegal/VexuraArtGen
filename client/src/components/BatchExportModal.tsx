import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Package, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BatchExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_SIZES = [
  { label: "512×512", value: "512x512" },
  { label: "1024×1024", value: "1024x1024" },
  { label: "1024×1792", value: "1024x1792" },
  { label: "1792×1024", value: "1792x1024" },
];

export function BatchExportModal({ open, onOpenChange }: BatchExportModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["1024x1024"]);
  const [includeLicense, setIncludeLicense] = useState(true);
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/batch_generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Sample prompt for batch export",
          sizes: selectedSizes,
          provider: "openai",
        }),
      });

      if (!response.ok) {
        throw new Error("Batch export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vexura-batch-${Date.now()}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Export Complete",
        description: "Your batch export has been downloaded.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to create batch export. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="modal-batch-export">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Batch Export
          </DialogTitle>
          <DialogDescription>
            Generate multiple sizes and download as a ZIP with metadata
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Size Selection */}
          <div className="space-y-3">
            <Label>Select Sizes to Export</Label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_SIZES.map((size) => (
                <div
                  key={size.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={size.value}
                    checked={selectedSizes.includes(size.value)}
                    onCheckedChange={() => toggleSize(size.value)}
                    data-testid={`checkbox-size-${size.value}`}
                  />
                  <Label
                    htmlFor={size.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {size.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* License Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="license"
              checked={includeLicense}
              onCheckedChange={(checked) => setIncludeLicense(checked as boolean)}
              data-testid="checkbox-license"
            />
            <Label htmlFor="license" className="text-sm font-normal cursor-pointer">
              Include license attribution metadata
            </Label>
          </div>

          {/* Export Preview */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-sm font-medium">Export will include:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {selectedSizes.length} image{selectedSizes.length > 1 ? "s" : ""} in selected sizes</li>
              <li>• metadata.csv with generation details</li>
              {includeLicense && <li>• license_info.txt with model attribution</li>}
              <li>• NFT-ready metadata.json for marketplaces</li>
            </ul>
          </div>

          {/* Progress */}
          {exportMutation.isPending && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Creating export package...</p>
              <Progress value={undefined} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={exportMutation.isPending}
              data-testid="button-cancel-export"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => exportMutation.mutate()}
              disabled={selectedSizes.length === 0 || exportMutation.isPending}
              data-testid="button-start-export"
            >
              <Download className="w-4 h-4" />
              {exportMutation.isPending ? "Exporting..." : "Export & Download"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
