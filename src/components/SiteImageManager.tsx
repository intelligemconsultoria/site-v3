import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ImageSelector } from "./ImageSelector";
import { Save, RotateCcw, Eye, Monitor, Smartphone, Database, Cloud, Upload } from "lucide-react";
import { SupabaseImageUploader } from "./SupabaseImageUploader";
import { SiteImageUploader } from "./SiteImageUploader";
import { SupabaseImageService, SiteImageMetadata } from "../services/supabaseImageService";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SimpleImageManager } from "./SimpleImageManager";

interface SiteImage {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
  category: 'logos' | 'hero' | 'sections' | 'backgrounds';
  dimensions: string;
  usage: string;
  previewComponent?: string;
}

const SITE_IMAGES: SiteImage[] = [
  // LOGOS
  {
    key: 'logo-header',
    label: 'Logo Principal (Header)',
    description: 'Logo que aparece no cabeçalho do site',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/1758897144652-eadaue4psn6.png',
    category: 'logos',
    dimensions: '200x60px',
    usage: 'Header, Footer',
    previewComponent: 'header-logo'
  },
  {
    key: 'logo-footer',
    label: 'Logo Rodapé',
    description: 'Logo que aparece no rodapé (pode ser diferente do header)',
    defaultValue: 'figma:asset/6b92ef4371fead8d661263f615c56e4cb4e3ce7f.png',
    category: 'logos',
    dimensions: '180x50px',
    usage: 'Footer',
    previewComponent: 'footer-logo'
  },
  {
    key: 'logo-gemflow',
    label: 'Logo GemFlow',
    description: 'Logo da solução GemFlow (Automação)',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/gemflow-logo.png',
    category: 'logos',
    dimensions: '80x80px',
    usage: 'Seção Soluções',
    previewComponent: 'solution-logo'
  },
  {
    key: 'logo-geminsights',
    label: 'Logo GemInsights',
    description: 'Logo da solução GemInsights (BI)',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/geminsights-logo.png',
    category: 'logos',
    dimensions: '80x80px',
    usage: 'Seção Soluções',
    previewComponent: 'solution-logo'
  },
  {
    key: 'logo-gemmind',
    label: 'Logo GemMind',
    description: 'Logo da solução GemMind (IA)',
    defaultValue: 'https://abfowubusomlibuihqrz.supabase.co/storage/v1/object/public/static-images/site/gemmind-logo.png',
    category: 'logos',
    dimensions: '80x80px',
    usage: 'Seção Soluções',
    previewComponent: 'solution-logo'
  },

  // HERO
  {
    key: 'hero-main',
    label: 'Hero - Imagem Principal',
    description: 'Imagem principal da seção hero (lado direito)',
    defaultValue: 'https://images.unsplash.com/photo-1752253604157-65fb42c30816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMG5ldHdvcmslMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1ODU3OTY1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'hero',
    dimensions: '600x400px',
    usage: 'Seção Hero - Desktop',
    previewComponent: 'hero-main'
  },
  {
    key: 'hero-background',
    label: 'Hero - Fundo',
    description: 'Imagem de fundo da seção hero (opcional)',
    defaultValue: '',
    category: 'hero',
    dimensions: '1920x1080px',
    usage: 'Seção Hero - Fundo',
    previewComponent: 'hero-bg'
  },

  // SEÇÕES
  {
    key: 'about-illustration',
    label: 'Sobre - Ilustração',
    description: 'Imagem da seção "Sobre a IntelliGem"',
    defaultValue: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=500&h=350&auto=format&fit=crop',
    category: 'sections',
    dimensions: '500x350px',
    usage: 'Seção Sobre',
    previewComponent: 'about-image'
  },
  {
    key: 'case-retail',
    label: 'Case - Varejo',
    description: 'Imagem do case de transformação digital no varejo',
    defaultValue: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyZXRhaWwlMjBhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzU4NTY4MjUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'sections',
    dimensions: '400x250px',
    usage: 'Seção Cases - Card Varejo',
    previewComponent: 'case-image'
  },
  {
    key: 'case-manufacturing',
    label: 'Case - Manufatura',
    description: 'Imagem do case de IA preditiva na manufatura',
    defaultValue: 'https://images.unsplash.com/photo-1752802469747-bff685763f3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtYW51ZmFjdHVyaW5nJTIwaW5kdXN0cnklMjBhdXRvbWF0aW9ufGVufDF8fHx8MTc1ODU3OTc0MXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'sections',
    dimensions: '400x250px',
    usage: 'Seção Cases - Card Manufatura',
    previewComponent: 'case-image'
  },
  {
    key: 'case-fintech',
    label: 'Case - Fintech',
    description: 'Imagem do case de automação financeira',
    defaultValue: 'https://images.unsplash.com/photo-1642406415849-a410b5d01a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxzdWNjZXNzZnVsJTIwYnVzaW5lc3MlMjB0ZWFtfGVufDF8fHx8MTc1ODU3OTczNXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'sections',
    dimensions: '400x250px',
    usage: 'Seção Cases - Card Fintech',
    previewComponent: 'case-image'
  },

  // BACKGROUNDS
  {
    key: 'cta-background',
    label: 'CTA - Fundo',
    description: 'Imagem de fundo da seção call-to-action',
    defaultValue: '',
    category: 'backgrounds',
    dimensions: '1920x600px',
    usage: 'Seção CTA',
    previewComponent: 'cta-bg'
  },
  {
    key: 'blog-featured',
    label: 'Blog - Imagem Destaque',
    description: 'Imagem padrão para artigos sem imagem',
    defaultValue: 'https://images.unsplash.com/photo-1740908900846-4bbd4f22c975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGJsb2d8ZW58MXx8fHwxNzU4NTc5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'backgrounds',
    dimensions: '400x250px',
    usage: 'Seção Blog',
    previewComponent: 'blog-default'
  },
  {
    key: 'blog-article-1',
    label: 'Blog - Futuro da Análise de Dados',
    description: 'Imagem do artigo sobre tendências de dados para 2025',
    defaultValue: 'https://images.unsplash.com/photo-1740908900846-4bbd4f22c975?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGJsb2d8ZW58MXx8fHwxNzU4NTc5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'backgrounds',
    dimensions: '400x250px',
    usage: 'Artigo Blog',
    previewComponent: 'blog-article'
  },
  {
    key: 'blog-article-2',
    label: 'Blog - IA Generativa nos Negócios',
    description: 'Imagem do artigo sobre IA generativa',
    defaultValue: 'https://images.unsplash.com/photo-1674027215001-9210851de177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwZnV0dXJlfGVufDF8fHx8MTc1ODU0NzQyMnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'backgrounds',
    dimensions: '400x250px',
    usage: 'Artigo Blog',
    previewComponent: 'blog-article'
  },
  {
    key: 'blog-article-3',
    label: 'Blog - Automação Inteligente',
    description: 'Imagem do artigo sobre ROI e implementação',
    defaultValue: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGF1dG9tYXRpb24lMjB0cmVuZHN8ZW58MXx8fHwxNzU4NTc5Nzc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'backgrounds',
    dimensions: '400x250px',
    usage: 'Artigo Blog',
    previewComponent: 'blog-article'
  }
];

export function SiteImageManager() {
  const [imageValues, setImageValues] = useState<Record<string, string>>({});
  const [supabaseImages, setSupabaseImages] = useState<Record<string, SiteImageMetadata>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedCategory, setSelectedCategory] = useState<string>('logos');
  const [useSupabase, setUseSupabase] = useState(true);

  useEffect(() => {
    loadSiteImages();
  }, []);

  const loadSiteImages = async () => {
    console.log('🏠 [SiteImageManager] loadSiteImages() iniciado');
    setLoading(true);
    console.log('⏳ [SiteImageManager] Loading state: true');
    
    try {
      const savedImages: Record<string, string> = {};
      const supabaseImagesData: Record<string, SiteImageMetadata> = {};
      
      console.log('🔄 [SiteImageManager] Carregando imagens do Supabase...');
      // Load from Supabase first
      const allSupabaseImages = await SupabaseImageService.getAllSiteImages();
      console.log('📊 [SiteImageManager] Imagens do Supabase recebidas:', allSupabaseImages);
      console.log('📊 [SiteImageManager] Quantidade de imagens do Supabase:', allSupabaseImages.length);
      
      allSupabaseImages.forEach(img => {
        supabaseImagesData[img.key] = img;
      });
      console.log('📋 [SiteImageManager] Supabase images data:', supabaseImagesData);
      
      console.log('🔄 [SiteImageManager] Processando SITE_IMAGES...');
      // Then check localStorage as fallback
      SITE_IMAGES.forEach(image => {
        console.log(`🖼️ [SiteImageManager] Processando imagem: ${image.key}`);
        const supabaseImg = supabaseImagesData[image.key];
        if (supabaseImg) {
          console.log(`✅ [SiteImageManager] Imagem ${image.key} encontrada no Supabase:`, supabaseImg.publicUrl);
          savedImages[image.key] = supabaseImg.publicUrl;
        } else {
          console.log(`⚠️ [SiteImageManager] Imagem ${image.key} não encontrada no Supabase, verificando localStorage...`);
          const saved = localStorage.getItem(`site-image-${image.key}`);
          const finalUrl = saved || image.defaultValue;
          console.log(`💾 [SiteImageManager] Imagem ${image.key} final URL:`, finalUrl);
          savedImages[image.key] = finalUrl;
        }
      });
      
      console.log('📋 [SiteImageManager] Supabase images data final:', supabaseImagesData);
      console.log('📋 [SiteImageManager] Saved images final:', savedImages);
      
      setSupabaseImages(supabaseImagesData);
      setImageValues(savedImages);
      console.log('✅ [SiteImageManager] Estados atualizados com sucesso');
    } catch (error) {
      console.error('❌ [SiteImageManager] Erro ao carregar imagens:', error);
      toast.error('Erro ao carregar imagens do Supabase');
      
      console.log('🔄 [SiteImageManager] Usando fallback localStorage...');
      // Fallback to localStorage only
      const savedImages: Record<string, string> = {};
      SITE_IMAGES.forEach(image => {
        const saved = localStorage.getItem(`site-image-${image.key}`);
        savedImages[image.key] = saved || image.defaultValue;
      });
      console.log('💾 [SiteImageManager] Fallback images:', savedImages);
      setImageValues(savedImages);
    } finally {
      setLoading(false);
      console.log('⏳ [SiteImageManager] Loading state: false');
    }
  };

  const handleImageChange = (key: string, value: string) => {
    setImageValues(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSupabaseImageUploaded = (imageKey: string, url: string, metadata: SiteImageMetadata) => {
    setSupabaseImages(prev => ({
      ...prev,
      [imageKey]: metadata
    }));
    
    setImageValues(prev => ({
      ...prev,
      [imageKey]: url
    }));
    
    // Auto-save to localStorage for immediate use
    localStorage.setItem(`site-image-${imageKey}`, url);
    
    // Dispatch event to update components immediately
    const event = new CustomEvent('site-images-updated', {
      detail: { [imageKey]: url }
    });
    window.dispatchEvent(event);
    
    toast.success('Imagem salva e aplicada com sucesso!');
  };

  const handleSupabaseImageDeleted = (imageKey: string) => {
    const newSupabaseImages = { ...supabaseImages };
    delete newSupabaseImages[imageKey];
    setSupabaseImages(newSupabaseImages);
    
    // Reset to default value
    const defaultImage = SITE_IMAGES.find(img => img.key === imageKey);
    const defaultValue = defaultImage?.defaultValue || '';
    
    setImageValues(prev => ({
      ...prev,
      [imageKey]: defaultValue
    }));
    
    // Update localStorage
    if (defaultValue) {
      localStorage.setItem(`site-image-${imageKey}`, defaultValue);
    } else {
      localStorage.removeItem(`site-image-${imageKey}`);
    }
    
    // Dispatch event
    const event = new CustomEvent('site-images-updated', {
      detail: { [imageKey]: defaultValue }
    });
    window.dispatchEvent(event);
    
    toast.success('Imagem removida e resetada para o padrão!');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage
      Object.entries(imageValues).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          localStorage.setItem(`site-image-${key}`, value);
        } else {
          localStorage.removeItem(`site-image-${key}`);
        }
      });
      
      // Trigger custom event to update the site
      window.dispatchEvent(new CustomEvent('site-images-updated', { 
        detail: imageValues 
      }));
      
      // Disparar evento de refresh para forçar cache-busting
      window.dispatchEvent(new CustomEvent('site-images-refresh'));
      
      toast.success('✅ Imagens do site atualizadas com sucesso!');
      setHasChanges(false);
    } catch (error) {
      toast.error('❌ Erro ao salvar as imagens');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (key: string) => {
    const defaultImage = SITE_IMAGES.find(img => img.key === key);
    if (defaultImage) {
      handleImageChange(key, defaultImage.defaultValue);
    }
  };

  const resetAll = () => {
    if (!confirm('⚠️ Tem certeza que deseja restaurar todas as imagens para os valores padrão?')) return;
    
    const defaultValues: Record<string, string> = {};
    SITE_IMAGES.forEach(image => {
      defaultValues[image.key] = image.defaultValue;
      localStorage.removeItem(`site-image-${image.key}`);
    });
    
    setImageValues(defaultValues);
    setHasChanges(true);
    toast.success('🔄 Imagens restauradas para os valores padrão');
  };

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, { title: string; icon: string; description: string }> = {
      logos: { title: 'Logos e Identidade', icon: '🎨', description: 'Logos da empresa e soluções' },
      hero: { title: 'Seção Principal', icon: '🎯', description: 'Imagens da primeira seção do site' },
      sections: { title: 'Seções do Site', icon: '📄', description: 'Imagens das seções sobre, cases, etc.' },
      backgrounds: { title: 'Fundos e Padrões', icon: '🖼️', description: 'Imagens de fundo e padrões' }
    };
    return titles[category] || { title: category, icon: '📁', description: '' };
  };

  const groupedImages = SITE_IMAGES.reduce((acc, image) => {
    if (!acc[image.category]) {
      acc[image.category] = [];
    }
    acc[image.category].push(image);
    return acc;
  }, {} as Record<string, SiteImage[]>);

  const renderImagePreview = (image: SiteImage, currentValue: string) => {
    const imageUrl = currentValue || image.defaultValue;
    if (!imageUrl) return null;

    return (
      <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm text-foreground/80">🔍 Preview - {image.usage}</h5>
          <div className="flex items-center gap-2">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className="h-7 px-2"
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className="h-7 px-2"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className={`relative overflow-hidden rounded-md border border-border bg-background ${
          previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
        }`}>
          {/* Preview específico por tipo */}
          {image.previewComponent === 'header-logo' && (
            <div className="flex items-center justify-between p-4 bg-background border-b border-border">
              <img src={imageUrl} alt="Logo Preview" className="h-8 w-auto object-contain" />
              <div className="text-xs text-foreground/60">Header Preview</div>
            </div>
          )}
          
          {image.previewComponent === 'hero-main' && (
            <div className="grid lg:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-background to-blue-900/20">
              <div className="space-y-4">
                <div className="h-4 bg-foreground/20 rounded w-3/4"></div>
                <div className="h-3 bg-foreground/10 rounded w-full"></div>
                <div className="h-8 bg-emerald-400/20 rounded w-32"></div>
              </div>
              <img src={imageUrl} alt="Hero Preview" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}
          
          {image.previewComponent === 'solution-logo' && (
            <div className="p-4 bg-card/50 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={imageUrl} alt="Solution Logo" className="w-12 h-12 object-contain rounded-lg bg-white/10 p-2" />
                <div>
                  <div className="h-4 bg-foreground/20 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-foreground/10 rounded w-32"></div>
                </div>
              </div>
            </div>
          )}
          
          {!['header-logo', 'hero-main', 'solution-logo'].includes(image.previewComponent || '') && (
            <div className="relative">
              <img 
                src={imageUrl} 
                alt={`Preview ${image.label}`} 
                className="w-full h-32 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {image.dimensions}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg">🎨 Imagens do Site</h3>
          <p className="text-foreground/60 text-sm">
            Gerencie todas as imagens e logos do site com preview em tempo real
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetAll}
            className="border-border text-foreground hover:bg-muted"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Tudo
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-emerald-400 text-black hover:bg-emerald-500"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            ⚠️ Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicá-las ao site.
          </p>
        </div>
      )}

      {/* Tabs por categoria */}
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-muted">
          <TabsTrigger 
            value="simple"
            className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black"
          >
            <Save className="w-4 h-4 mr-2" />
            Simples
          </TabsTrigger>
          <TabsTrigger 
            value="migration"
            className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black"
          >
            <Upload className="w-4 h-4 mr-2" />
            Migração
          </TabsTrigger>
          <TabsTrigger 
            value="supabase"
            className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Supabase Storage
          </TabsTrigger>
          {Object.keys(groupedImages).map((category) => {
            const categoryInfo = getCategoryTitle(category);
            return (
              <TabsTrigger 
                key={category} 
                value={category}
                className="data-[state=active]:bg-emerald-400 data-[state=active]:text-black"
              >
                <span className="mr-2">{categoryInfo.icon}</span>
                {categoryInfo.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Aba Simples */}
        <TabsContent value="simple" className="space-y-6 mt-6">
          <SimpleImageManager onImageChange={handleImageChange} />
        </TabsContent>

        {/* Aba Migração */}
        <TabsContent value="migration" className="space-y-6 mt-6">
          <SiteImageUploader />
        </TabsContent>

        {/* Aba Supabase Storage */}
        <TabsContent value="supabase" className="space-y-6 mt-6">
          <div className="text-center p-6 bg-card/30 rounded-lg border border-border">
            <h4 className="text-foreground flex items-center justify-center gap-3 text-xl mb-2">
              <Cloud className="w-6 h-6 text-emerald-400" />
              Supabase Storage
            </h4>
            <p className="text-foreground/60 text-sm mb-4">
              Faça upload das suas imagens diretamente para o Supabase Storage. As imagens são aplicadas automaticamente no site.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge variant="outline" className="bg-emerald-400/10 border-emerald-400/20">
                <Database className="w-3 h-3 mr-1" />
                {loading ? 'Carregando...' : `${Object.keys(supabaseImages).length} imagens no Supabase`}
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-foreground/60 mt-4">Carregando imagens...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {SITE_IMAGES.map((image) => {
                const supabaseImg = supabaseImages[image.key];
                const hasSupabaseImage = !!supabaseImg;
                
                return (
                  <Card key={`supabase-${image.key}`} className="bg-card border-border">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-foreground text-base flex items-center gap-2">
                            {image.label}
                            {hasSupabaseImage && (
                              <Badge variant="default" className="bg-emerald-400/20 text-emerald-400 border-emerald-400/20">
                                <Cloud className="w-3 h-3 mr-1" />
                                No Supabase
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-foreground/60 text-sm">{image.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              📐 {image.dimensions}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              📍 {image.usage}
                            </Badge>
                            {hasSupabaseImage && (
                              <Badge variant="outline" className="text-xs text-green-400">
                                ✅ Uploaded
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <SupabaseImageUploader
                        imageKey={image.key}
                        imageName={image.label}
                        category={image.category}
                        currentUrl={hasSupabaseImage ? supabaseImg.publicUrl : ''}
                        onImageUploaded={(url, metadata) => handleSupabaseImageUploaded(image.key, url, metadata)}
                        onImageDeleted={() => handleSupabaseImageDeleted(image.key)}
                        maxSizeMB={10}
                      />
                      
                      {hasSupabaseImage && (
                        <div className="mt-4 p-3 bg-emerald-400/5 border border-emerald-400/20 rounded-lg">
                          <div className="text-xs text-emerald-400 space-y-1">
                            <div><strong>Arquivo:</strong> {supabaseImg.originalName}</div>
                            <div><strong>Tamanho:</strong> {(supabaseImg.size / 1024 / 1024).toFixed(2)} MB</div>
                            <div><strong>Upload:</strong> {new Date(supabaseImg.uploadedAt).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Preview da imagem */}
                      {(hasSupabaseImage || imageValues[image.key]) && 
                        renderImagePreview(image, hasSupabaseImage ? supabaseImg.publicUrl : imageValues[image.key])
                      }
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {Object.entries(groupedImages).map(([category, images]) => {
          const categoryInfo = getCategoryTitle(category);
          return (
            <TabsContent key={category} value={category} className="space-y-6 mt-6">
              {/* Header da categoria */}
              <div className="text-center p-4 bg-card/30 rounded-lg border border-border">
                <h4 className="text-foreground flex items-center justify-center gap-2">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  {categoryInfo.title}
                </h4>
                <p className="text-foreground/60 text-sm mt-1">{categoryInfo.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
                </Badge>
              </div>

              {/* Imagens da categoria */}
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {images.map((image) => (
                  <Card key={image.key} className="bg-card border-border">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-foreground text-base">{image.label}</CardTitle>
                          <p className="text-foreground/60 text-sm">{image.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              📐 {image.dimensions}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              📍 {image.usage}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReset(image.key)}
                          className="text-foreground/70 hover:text-foreground"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Padrão
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ImageSelector
                        value={imageValues[image.key] || ''}
                        onChange={(value) => handleImageChange(image.key, value)}
                        placeholder="Selecione uma imagem do gerenciador ou insira URL"
                        targetDimensions={(() => {
                          const [width, height] = image.dimensions.replace('px', '').split('x').map(Number);
                          return { width, height };
                        })()}
                        targetName={image.label}
                        showCrop={true}
                      />
                      
                      {/* Preview da imagem */}
                      {renderImagePreview(image, imageValues[image.key])}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Dicas de uso */}
      <div className="bg-muted/30 rounded-lg p-6 border border-border">
        <h4 className="text-foreground mb-4 flex items-center gap-2">
          💡 Dicas de Uso
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h5 className="text-foreground/80 mb-2 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              Supabase Storage
            </h5>
            <ul className="text-foreground/70 text-sm space-y-1">
              <li>• <strong>Recomendado:</strong> Upload direto para melhor performance</li>
              <li>• URLs automaticamente geradas e seguras</li>
              <li>• Backup automático das suas imagens</li>
              <li>• Aplicação instantânea no site</li>
            </ul>
          </div>
          <div>
            <h5 className="text-foreground/80 mb-2">🎯 Qualidade das Imagens</h5>
            <ul className="text-foreground/70 text-sm space-y-1">
              <li>• Use imagens com boa resolução (mínimo 2x do tamanho final)</li>
              <li>• Prefira formatos JPG ou WebP para melhor performance</li>
              <li>• Logos devem ter fundo transparente (PNG)</li>
              <li>• Máximo 10MB por arquivo</li>
            </ul>
          </div>
          <div>
            <h5 className="text-foreground/80 mb-2">⚡ Funcionalidades</h5>
            <ul className="text-foreground/70 text-sm space-y-1">
              <li>• Preview em tempo real das alterações</li>
              <li>• Sistema de crop automático para logos</li>
              <li>• Fallback automático para URLs externas</li>
              <li>• Sincronização entre Supabase e localStorage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}