import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ZoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageDataUri: string | null | undefined;
}

export function ZoomModal({ open, onOpenChange, imageDataUri }: ZoomModalProps) {
  if (!imageDataUri) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        data-testid="modal-zoom"
      >
        <div className="relative w-full h-full flex items-center justify-center p-8">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-zoom"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Image */}
          <img
            src={imageDataUri}
            alt="Full size artwork"
            className="max-w-full max-h-[90vh] object-contain"
            data-testid="image-zoomed"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
