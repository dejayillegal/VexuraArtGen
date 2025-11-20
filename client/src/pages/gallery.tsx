import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Trash2, Upload, Maximize2 } from "lucide-react";
import { getAllGenerations, deleteGeneration } from "@/lib/db";
import { ZoomModal } from "@/components/ZoomModal";
import { IpfsUploadModal } from "@/components/IpfsUploadModal";
import { useToast } from "@/hooks/use-toast";
import type { Generation } from "@shared/schema";

export default function Gallery() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showIpfsModal, setShowIpfsModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    setIsLoading(true);
    try {
      const data = await getAllGenerations();
      setGenerations(data);
    } catch (error) {
      console.error("Failed to load generations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGeneration(id);
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast({
        title: "Deleted",
        description: "Artwork removed from gallery.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete artwork.",
        variant: "destructive",
      });
    }
  };

  const downloadImage = (dataUri: string, id: string) => {
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = `vexura-${id}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
              Recent Creations
            </h1>
            <p className="text-lg text-muted-foreground">
              Your generated artworks saved locally
            </p>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : generations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <Download className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-xl">No Artworks Yet</h3>
                <p className="text-muted-foreground">
                  Start creating to see your artworks here
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {generations.map((gen, index) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group" data-testid={`card-generation-${index}`}>
                    {/* Image */}
                    <div
                      className="aspect-square cursor-pointer relative overflow-hidden"
                      onClick={() => {
                        setSelectedImage(gen.imageDataUri);
                        setShowZoomModal(true);
                      }}
                    >
                      <img
                        src={gen.imageDataUri}
                        alt={gen.prompt}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <p className="text-sm line-clamp-2 min-h-[2.5rem]">
                        {gen.prompt}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {gen.provider || 'Unknown'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {gen.width || 512}×{gen.height || 512}
                        </Badge>
                        {gen.cid && (
                          <Badge variant="outline" className="text-xs">
                            IPFS
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1"
                          onClick={() => {
                            setSelectedImage(gen.imageDataUri);
                            setShowZoomModal(true);
                          }}
                          data-testid={`button-view-${index}`}
                        >
                          <Maximize2 className="w-3 h-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadImage(gen.imageDataUri, gen.id)}
                          data-testid={`button-download-${index}`}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        {!gen.cid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedImage(gen.imageDataUri);
                              setShowIpfsModal(true);
                            }}
                            data-testid={`button-ipfs-${index}`}
                          >
                            <Upload className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(gen.id)}
                          data-testid={`button-delete-${index}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ZoomModal
        open={showZoomModal}
        onOpenChange={setShowZoomModal}
        imageDataUri={selectedImage}
      />
      <IpfsUploadModal
        open={showIpfsModal}
        onOpenChange={setShowIpfsModal}
        imageDataUri={selectedImage}
      />
    </div>
  );
}