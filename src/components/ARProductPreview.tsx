import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Scan, X } from "lucide-react";
import { toast } from "sonner";

interface ARProductPreviewProps {
  productImage: string;
  productName: string;
}

export function ARProductPreview({ productImage, productName }: ARProductPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleARView = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("AR not supported on this device");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleARView}
        className="gap-2"
      >
        <Scan className="h-4 w-4" />
        View in AR
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>AR Preview: {productName}</span>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Scan className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                <p className="text-lg mb-2">AR Preview Mode</p>
                <p className="text-sm text-gray-300">Point your camera at a flat surface</p>
              </div>
            </div>
            <img
              src={productImage}
              alt={productName}
              className="absolute inset-0 w-full h-full object-contain opacity-50"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
