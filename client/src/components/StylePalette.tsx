import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Style } from "@shared/schema";

interface StylePaletteProps {
  selectedStyle: Style | null;
  onSelectStyle: (style: Style | null) => void;
}

export function StylePalette({ selectedStyle, onSelectStyle }: StylePaletteProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: styles, isLoading } = useQuery<Style[]>({
    queryKey: ["/api/styles"],
  });

  const uploadStyleMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("style", file);
      
      const response = await fetch("/api/upload_style", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload style");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/styles"] });
      toast({
        title: "Style Uploaded",
        description: "Your style image has been added to the palette.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload style image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    uploadStyleMutation.mutate(file);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl mb-2">Style Palette</h2>
        <p className="text-sm text-muted-foreground">
          Select a style to apply to your generation
        </p>
      </div>

      {/* Upload New Style */}
      <div>
        <input
          type="file"
          id="style-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
          data-testid="input-upload-style"
        />
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => document.getElementById("style-upload")?.click()}
          disabled={uploadStyleMutation.isPending}
          data-testid="button-upload-style"
        >
          <Upload className="w-4 h-4" />
          {uploadStyleMutation.isPending ? "Uploading..." : "Upload New Style"}
        </Button>
      </div>

      {/* Clear Selection */}
      {selectedStyle && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onSelectStyle(null)}
          data-testid="button-clear-style"
        >
          Clear Selection
        </Button>
      )}

      {/* Style Grid */}
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </>
        ) : styles && styles.length > 0 ? (
          styles.map((style, index) => (
            <motion.div
              key={style.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card
                className={`
                  aspect-square overflow-hidden cursor-pointer relative group
                  hover-elevate active-elevate-2
                  ${selectedStyle?.name === style.name ? "ring-2 ring-primary" : ""}
                `}
                onClick={() => onSelectStyle(style)}
                data-testid={`card-style-${index}`}
              >
                <img
                  src={style.thumbUri}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {style.name}
                  </p>
                </div>

                {/* Selected Indicator */}
                {selectedStyle?.name === style.name && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-sm text-muted-foreground">
              No styles available. Upload your first style image.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
