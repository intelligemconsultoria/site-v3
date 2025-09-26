import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ImageManager } from "./ImageManager";
import { ImageCropper } from "./ImageCropper";
import { Image, ExternalLink, Crop, Upload } from "lucide-react";

interface ImageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  targetDimensions?: { width: number; height: number };
  targetName?: string;
  showCrop?: boolean;
}

export function ImageSelector({ 
  value, 
  onChange, 
  label = "Imagem", 
  placeholder = "URL da imagem ou selecione do gerenciador",
  targetDimensions,
  targetName = "Imagem",
  showCrop = false
}: ImageSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageForCrop, setImageForCrop] = useState("");

  const handleImageSelect = (imageUrl: string) => {
    if (showCrop && targetDimensions) {
      setImageForCrop(imageUrl);
      setIsDialogOpen(false);
      setIsCropperOpen(true);
    } else {
      onChange(imageUrl);
      setIsDialogOpen(false);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    onChange(croppedImageUrl);
    setIsCropperOpen(false);
  };

  const handleDirectUpload = () => {
    if (value && showCrop && targetDimensions) {
      setImageForCrop(value);
      setIsCropperOpen(true);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>
      
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-input-background border-border text-foreground flex-1"
          placeholder={placeholder}
        />
        
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="border-border text-foreground hover:bg-muted flex-shrink-0"
              >
                <Image className="w-4 h-4 mr-2" />
                Selecionar
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Selecionar Imagem</DialogTitle>
              </DialogHeader>
              
              <div className="max-h-[80vh] overflow-y-auto">
                <ImageManager onImageSelect={handleImageSelect} />
              </div>
            </DialogContent>
          </Dialog>

          {showCrop && targetDimensions && value && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDirectUpload}
              className="border-border text-foreground hover:bg-muted flex-shrink-0"
            >
              <Crop className="w-4 h-4 mr-2" />
              Ajustar
            </Button>
          )}
        </div>

      </div>

      {/* Preview da imagem atual */}
      {value && (
        <div className="mt-3">
          <div className="relative w-full max-w-sm">
            <img
              src={value}
              alt="Preview"
              className={`w-full h-32 rounded-lg border border-border ${
                targetName?.toLowerCase().includes('logo') 
                  ? 'object-contain bg-white/5 p-3' 
                  : 'object-cover'
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-foreground/70 hover:text-foreground bg-black/50 hover:bg-black/70"
              onClick={() => window.open(value, '_blank')}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
            
            {showCrop && targetDimensions && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Tamanho ideal: {targetDimensions.width}×{targetDimensions.height}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Cropper */}
      {showCrop && targetDimensions && (
        <ImageCropper
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageUrl={imageForCrop}
          targetDimensions={targetDimensions}
          targetName={targetName}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}