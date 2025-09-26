import { useState, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Slider } from "./ui/slider";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Crop, RotateCcw, Check, X, ZoomIn, ZoomOut, Move } from "lucide-react";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  targetDimensions: { width: number; height: number };
  onCropComplete: (croppedImageUrl: string) => void;
  targetName: string;
}

export function ImageCropper({ 
  isOpen, 
  onClose, 
  imageUrl, 
  targetDimensions, 
  onCropComplete,
  targetName 
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const loadImage = useCallback(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      
      // Calcular escala inicial para fit
      const scaleX = targetDimensions.width / img.width;
      const scaleY = targetDimensions.height / img.height;
      const initialScale = Math.max(scaleX, scaleY);
      
      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
      
      // Desenhar imagem inicial
      setTimeout(() => drawImage(img, initialScale, { x: 0, y: 0 }), 100);
    };
    img.src = imageUrl;
  }, [imageUrl, targetDimensions]);

  const drawImage = useCallback((
    img: HTMLImageElement, 
    currentScale: number, 
    currentPosition: { x: number; y: number }
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = targetDimensions.width;
    canvas.height = targetDimensions.height;

    // Limpar canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calcular dimensões da imagem escalada
    const scaledWidth = img.width * currentScale;
    const scaledHeight = img.height * currentScale;

    // Calcular posição centralizada
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const x = centerX - scaledWidth / 2 + currentPosition.x;
    const y = centerY - scaledHeight / 2 + currentPosition.y;

    // Desenhar imagem
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    // Desenhar grid de orientação
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Linhas verticais
    ctx.beginPath();
    ctx.moveTo(canvas.width / 3, 0);
    ctx.lineTo(canvas.width / 3, canvas.height);
    ctx.moveTo((canvas.width * 2) / 3, 0);
    ctx.lineTo((canvas.width * 2) / 3, canvas.height);
    ctx.stroke();

    // Linhas horizontais
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 3);
    ctx.lineTo(canvas.width, canvas.height / 3);
    ctx.moveTo(0, (canvas.height * 2) / 3);
    ctx.lineTo(canvas.width, (canvas.height * 2) / 3);
    ctx.stroke();

    ctx.setLineDash([]);
  }, [targetDimensions]);

  // Redraw quando scale ou position mudam
  useState(() => {
    if (image) {
      drawImage(image, scale, position);
    }
  });

  const handleScaleChange = (newScale: number[]) => {
    const scaleValue = newScale[0];
    setScale(scaleValue);
    if (image) {
      drawImage(image, scaleValue, position);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    setPosition(newPosition);
    if (image) {
      drawImage(image, scale, newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    if (!image) return;
    
    const scaleX = targetDimensions.width / image.width;
    const scaleY = targetDimensions.height / image.height;
    const initialScale = Math.max(scaleX, scaleY);
    
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
    drawImage(image, initialScale, { x: 0, y: 0 });
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Converter canvas para blob e depois para URL
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedUrl = URL.createObjectURL(blob);
        onCropComplete(croppedUrl);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleOpen = () => {
    if (isOpen) {
      loadImage();
    }
  };

  // Load image when dialog opens
  useState(() => {
    if (isOpen) {
      loadImage();
    }
  });

  const aspectRatio = targetDimensions.width / targetDimensions.height;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Ajustar Imagem - {targetName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Editor de Crop */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-muted/20 border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      📐 {targetDimensions.width} × {targetDimensions.height}px
                    </Badge>
                    <Badge variant="outline">
                      📏 Proporção {aspectRatio.toFixed(2)}:1
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </div>

                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-dashed border-border rounded-lg cursor-move max-w-full h-auto"
                    style={{ 
                      aspectRatio: `${targetDimensions.width}/${targetDimensions.height}`,
                      maxHeight: '400px'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                  
                  {isDragging && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Move className="w-3 h-3" />
                      Arrastando...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controles */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-foreground text-sm">Zoom</label>
                      <span className="text-foreground/60 text-xs">{Math.round(scale * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ZoomOut className="w-4 h-4 text-foreground/60" />
                      <Slider
                        value={[scale]}
                        onValueChange={handleScaleChange}
                        min={0.1}
                        max={3}
                        step={0.1}
                        className="flex-1"
                      />
                      <ZoomIn className="w-4 h-4 text-foreground/60" />
                    </div>
                  </div>

                  <div className="text-foreground/60 text-xs">
                    💡 Dica: Use o mouse para arrastar a imagem e o slider para fazer zoom
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview e informações */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h4 className="text-foreground mb-3">🔍 Preview Final</h4>
                <div className="bg-muted/20 rounded-lg p-3 border border-border">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto rounded border border-border"
                    style={{
                      aspectRatio: `${targetDimensions.width}/${targetDimensions.height}`,
                      maxHeight: '200px'
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h4 className="text-foreground mb-3">ℹ️ Informações</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Destino:</span>
                    <span className="text-foreground">{targetName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Tamanho:</span>
                    <span className="text-foreground">{targetDimensions.width}×{targetDimensions.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Formato:</span>
                    <span className="text-foreground">JPEG, 90% qualidade</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-foreground/60 text-sm">
            A imagem será automaticamente redimensionada para o tamanho ideal
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleCrop}
              className="bg-emerald-400 text-black hover:bg-emerald-500"
            >
              <Check className="w-4 h-4 mr-2" />
              Aplicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}