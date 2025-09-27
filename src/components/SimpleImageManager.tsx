import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Save, RotateCcw, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface SimpleImage {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
  category: string;
  dimensions: string;
}

const SIMPLE_IMAGES: SimpleImage[] = [
  // LOGOS PRINCIPAIS
  {
    key: 'logo-header',
    label: '🏠 Logo do Cabeçalho',
    description: 'Logo principal que aparece no topo do site',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/1758897144652-eadaue4psn6.png',
    category: 'logos',
    dimensions: '40x40px'
  },
  {
    key: 'logo-footer',
    label: '🦶 Logo do Rodapé',
    description: 'Logo que aparece no rodapé (pode ser diferente)',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/1758897144652-eadaue4psn6.png',
    category: 'logos',
    dimensions: '180x50px'
  },
  
  // LOGOS DAS SOLUÇÕES
  {
    key: 'logo-gemflow',
    label: '⚡ Logo GemFlow',
    description: 'Logo da solução GemFlow (Automação)',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/gemflow-logo.png',
    category: 'solutions',
    dimensions: '80x80px'
  },
  {
    key: 'logo-geminsights',
    label: '📊 Logo GemInsights',
    description: 'Logo da solução GemInsights (BI)',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/geminsights-logo.png',
    category: 'solutions',
    dimensions: '80x80px'
  },
  {
    key: 'logo-gemmind',
    label: '🧠 Logo GemMind',
    description: 'Logo da solução GemMind (IA)',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/gemmind-logo.png',
    category: 'solutions',
    dimensions: '80x80px'
  },
  
  // IMAGENS PRINCIPAIS
  {
    key: 'hero-main',
    label: '🖼️ Imagem Principal (Hero)',
    description: 'Primeira imagem que aparece no site (seção hero)',
    defaultValue: 'https://images.unsplash.com/photo-1758657286956-f944e1d2e75a?crop=entro...kwNDE2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'hero',
    dimensions: 'Responsiva (1080px)'
  },
  
  // IMAGENS DOS CARDS DAS SOLUÇÕES
  {
    key: 'solution-gemflow-image',
    label: '⚡ Imagem GemFlow',
    description: 'Imagem do card da solução GemFlow (Automação)',
    defaultValue: 'https://images.unsplash.com/photo-1758387933125-5ac945b4e2cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbWF0aW9uJTIwcHJvY2VzcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU4NTc5NjU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'solutions-cards',
    dimensions: 'Responsiva (1080px)'
  },
  {
    key: 'solution-geminsights-image',
    label: '📊 Imagem GemInsights',
    description: 'Imagem do card da solução GemInsights (BI)',
    defaultValue: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGludGVsbGlnZW5jZSUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NTg1NjkwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'solutions-cards',
    dimensions: 'Responsiva (1080px)'
  },
  {
    key: 'solution-gemmind-image',
    label: '🧠 Imagem GemMind',
    description: 'Imagem do card da solução GemMind (IA)',
    defaultValue: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg0ODA0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'solutions-cards',
    dimensions: 'Responsiva (1080px)'
  }
];

interface SimpleImageManagerProps {
  onImageChange?: (key: string, value: string) => void;
}

export function SimpleImageManager({ onImageChange }: SimpleImageManagerProps) {
  const [imageValues, setImageValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Carregar valores salvos do localStorage
    const savedValues: Record<string, string> = {};
    SIMPLE_IMAGES.forEach(image => {
      const saved = localStorage.getItem(`site-image-${image.key}`);
      if (saved) {
        savedValues[image.key] = saved;
      } else {
        savedValues[image.key] = image.defaultValue;
      }
    });
    setImageValues(savedValues);
  }, []);

  const handleImageChange = (key: string, value: string) => {
    setImageValues(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Notificar o componente pai sobre a mudança
    if (onImageChange) {
      onImageChange(key, value);
    }
  };

  const handleReset = (key: string) => {
    const image = SIMPLE_IMAGES.find(img => img.key === key);
    if (image) {
      handleImageChange(key, image.defaultValue);
      toast.success(`${image.label} resetado para o padrão!`);
    }
  };

  const logos = SIMPLE_IMAGES.filter(img => img.category === 'logos');
  const solutions = SIMPLE_IMAGES.filter(img => img.category === 'solutions');
  const hero = SIMPLE_IMAGES.filter(img => img.category === 'hero');
  const solutionsCards = SIMPLE_IMAGES.filter(img => img.category === 'solutions-cards');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">🖼️ Gerenciador de Imagens</h2>
        <p className="text-foreground/60 mt-1">Gerencie as imagens do seu site de forma simples</p>
      </div>

      {/* LOGOS PRINCIPAIS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logos Principais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {logos.map((image) => (
            <div key={image.key} className="p-4 border border-border rounded-lg bg-card/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{image.label}</h4>
                  <p className="text-sm text-foreground/60">{image.description}</p>
                  <p className="text-xs text-foreground/40 mt-1">Dimensões: {image.dimensions}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReset(image.key)}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Resetar
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">
                    URL da Imagem:
                  </label>
                  <input
                    type="url"
                    value={imageValues[image.key] || ''}
                    onChange={(e) => handleImageChange(image.key, e.target.value)}
                    placeholder="Cole a URL da imagem aqui..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                
                {imageValues[image.key] && (
                  <div className="mt-3">
                    <p className="text-sm text-foreground/60 mb-2">Preview:</p>
                    <div className="border border-border rounded-md p-4 bg-background/50 flex items-center justify-center">
                      <img 
                        src={imageValues[image.key]} 
                        alt={image.label}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* LOGOS DAS SOLUÇÕES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logos das Soluções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {solutions.map((image) => (
            <div key={image.key} className="p-4 border border-border rounded-lg bg-card/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{image.label}</h4>
                  <p className="text-sm text-foreground/60">{image.description}</p>
                  <p className="text-xs text-foreground/40 mt-1">Dimensões: {image.dimensions}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReset(image.key)}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Resetar
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">
                    URL da Imagem:
                  </label>
                  <input
                    type="url"
                    value={imageValues[image.key] || ''}
                    onChange={(e) => handleImageChange(image.key, e.target.value)}
                    placeholder="Cole a URL da imagem aqui..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                
                {imageValues[image.key] && (
                  <div className="mt-3">
                    <p className="text-sm text-foreground/60 mb-2">Preview:</p>
                    <div className="border border-border rounded-md p-4 bg-background/50 flex items-center justify-center">
                      <img 
                        src={imageValues[image.key]} 
                        alt={image.label}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* IMAGENS HERO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Imagens Principais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hero.map((image) => (
            <div key={image.key} className="p-4 border border-border rounded-lg bg-card/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{image.label}</h4>
                  <p className="text-sm text-foreground/60">{image.description}</p>
                  <p className="text-xs text-foreground/40 mt-1">Dimensões: {image.dimensions}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReset(image.key)}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Resetar
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">
                    URL da Imagem:
                  </label>
                  <input
                    type="url"
                    value={imageValues[image.key] || ''}
                    onChange={(e) => handleImageChange(image.key, e.target.value)}
                    placeholder="Cole a URL da imagem aqui..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                
                {imageValues[image.key] && (
                  <div className="mt-3">
                    <p className="text-sm text-foreground/60 mb-2">Preview:</p>
                    <div className="border border-border rounded-md p-4 bg-background/50 flex items-center justify-center">
                      <img 
                        src={imageValues[image.key]} 
                        alt={image.label}
                        className="w-32 h-20 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* IMAGENS DOS CARDS DAS SOLUÇÕES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Imagens dos Cards das Soluções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {solutionsCards.map((image) => (
            <div key={image.key} className="p-4 border border-border rounded-lg bg-card/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{image.label}</h4>
                  <p className="text-sm text-foreground/60">{image.description}</p>
                  <p className="text-xs text-foreground/40 mt-1">Dimensões: {image.dimensions}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReset(image.key)}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Resetar
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">
                    URL da Imagem:
                  </label>
                  <input
                    type="url"
                    value={imageValues[image.key] || ''}
                    onChange={(e) => handleImageChange(image.key, e.target.value)}
                    placeholder="Cole a URL da imagem aqui..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                
                {imageValues[image.key] && (
                  <div className="mt-3">
                    <p className="text-sm text-foreground/60 mb-2">Preview:</p>
                    <div className="border border-border rounded-md p-4 bg-background/50 flex items-center justify-center">
                      <img 
                        src={imageValues[image.key]} 
                        alt={image.label}
                        className="w-32 h-20 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* INSTRUÇÕES */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-3">📋 Como usar:</h3>
          <ol className="space-y-2 text-sm text-foreground/70">
            <li>1. <strong>Faça upload das imagens</strong> no Supabase Storage (pasta <code>static-images/site/</code>)</li>
            <li>2. <strong>Copie a URL pública</strong> da imagem do Supabase</li>
            <li>3. <strong>Cole a URL</strong> no campo correspondente acima</li>
            <li>4. <strong>Clique em "Salvar Tudo"</strong> para aplicar as mudanças</li>
            <li>5. <strong>Recarregue a página</strong> para ver as mudanças no site</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
