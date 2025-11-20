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
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface IpfsUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageDataUri: string | null | undefined;
}

export function IpfsUploadModal({ open, onOpenChange, imageDataUri }: IpfsUploadModalProps) {
  const [cid, setCid] = useState<string | null>(null);
  const [gatewayUrl, setGatewayUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!imageDataUri) throw new Error("No image to upload");

      // Convert data URI to base64
      const base64 = imageDataUri.split(",")[1];

      const response = await apiRequest("POST", "/api/ipfs_upload", {
        zipB64: base64,
      });

      return await response.json();
    },
    onSuccess: (data: any) => {
      setCid(data.cid);
      setGatewayUrl(data.url);
      toast({
        title: "Upload Successful",
        description: "Your artwork has been uploaded to IPFS.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload to IPFS. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyCID = () => {
    if (cid) {
      navigator.clipboard.writeText(cid);
      toast({
        title: "Copied",
        description: "CID copied to clipboard.",
      });
    }
  };

  const handleClose = () => {
    setCid(null);
    setGatewayUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-ipfs-upload">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload to IPFS
          </DialogTitle>
          <DialogDescription>
            Store your artwork permanently on the decentralized web
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!cid ? (
            <>
              {/* Upload Info */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <p className="text-sm font-medium">What is IPFS?</p>
                <p className="text-sm text-muted-foreground">
                  IPFS (InterPlanetary File System) is a decentralized storage network
                  that ensures your artwork remains permanently accessible, perfect for
                  NFTs and digital collectibles.
                </p>
              </div>

              {/* Progress */}
              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Uploading to nft.storage...
                  </p>
                  <Progress value={undefined} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={uploadMutation.isPending}
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => uploadMutation.mutate()}
                  disabled={!imageDataUri || uploadMutation.isPending}
                  data-testid="button-start-upload"
                >
                  <Upload className="w-4 h-4" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload to IPFS"}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Upload Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your artwork is now stored on IPFS
                  </p>
                </div>
              </div>

              {/* CID */}
              <div className="space-y-2">
                <Label>Content Identifier (CID)</Label>
                <div className="flex gap-2">
                  <Input
                    value={cid}
                    readOnly
                    className="font-mono text-sm"
                    data-testid="input-cid"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyCID}
                    data-testid="button-copy-cid"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Gateway URL */}
              {gatewayUrl && (
                <div className="space-y-2">
                  <Label>Gateway URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={gatewayUrl}
                      readOnly
                      className="text-sm"
                      data-testid="input-gateway-url"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(gatewayUrl, "_blank")}
                      data-testid="button-open-gateway"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong className="text-foreground">Note:</strong> Your content is pinned
                  on nft.storage and will remain accessible as long as the service is active.
                </p>
                <p>
                  Save your CID to reference this artwork in NFT metadata or marketplaces.
                </p>
              </div>

              {/* Close Button */}
              <Button
                className="w-full"
                onClick={handleClose}
                data-testid="button-close-success"
              >
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
