import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Type,
  MoreHorizontal,
  Undo2,
  Redo2,
  ChevronDown
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Digite seu conteúdo...", 
  className = "",
  minHeight = "400px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isToolbarFloating, setIsToolbarFloating] = useState(false);
  const isUpdatingFromProps = useRef(false);

  // Effect para controlar barra flutuante baseada no scroll
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!toolbarRef.current || !editorRef.current) {
            ticking = false;
            return;
          }
          
          const editorRect = editorRef.current.getBoundingClientRect();
          const toolbarHeight = 60; // Altura aproximada da barra de ferramentas
          
          // Lógica melhorada para transição suave
          if (isToolbarFloating) {
            // Se está flutuante, só volta ao normal quando o editor estiver bem visível
            const shouldStayFloating = editorRect.top > (toolbarHeight + 20);
            if (!shouldStayFloating) {
              setIsToolbarFloating(false);
            }
          } else {
            // Se não está flutuante, flutua quando o editor sair da área superior
            const shouldFloat = editorRect.top < -20; // Margem para evitar flickering
            if (shouldFloat) {
              setIsToolbarFloating(true);
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Adicionar listener de scroll com throttling
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Verificar posição inicial após um pequeno delay
    setTimeout(() => {
      handleScroll();
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isToolbarFloating]);

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const formatText = (format: string) => {
    executeCommand(format);
  };

  const insertHeading = (level: string) => {
    executeCommand('formatBlock', level);
  };

  const insertList = (type: 'insertOrderedList' | 'insertUnorderedList') => {
    executeCommand(type);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = linkText;
        link.className = 'text-emerald-400 hover:text-emerald-300 underline';
        
        range.insertNode(link);
        range.setStartAfter(link);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      
      setLinkUrl('');
      setLinkText('');
      setIsLinkDialogOpen(false);
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const img = `<img src="${imageUrl}" alt="${imageAlt}" class="max-w-full h-auto rounded-lg my-4" />`;
      executeCommand('insertHTML', img);
      setImageUrl('');
      setImageAlt('');
      setIsImageDialogOpen(false);
    }
  };

  const setTextAlign = (alignment: string) => {
    executeCommand('justify' + alignment);
  };

  const handleEditorChange = () => {
    if (editorRef.current && !isUpdatingFromProps.current) {
      const content = editorRef.current.innerHTML;
      // Limpa o conteúdo se estiver vazio
      if (content === '<br>' || content === '<div><br></div>' || content.trim() === '') {
        onChange('');
      } else {
        onChange(content);
      }
    }
  };

  // Atualiza o conteúdo apenas quando o value muda externamente
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      isUpdatingFromProps.current = true;
      
      // Salva a posição do cursor se houver seleção ativa
      const selection = window.getSelection();
      let range: Range | null = null;
      let cursorPosition = 0;
      
      if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
        range = selection.getRangeAt(0);
        // Calcula a posição do cursor em relação ao início do elemento
        const walker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_TEXT,
          null
        );
        let node;
        while (node = walker.nextNode()) {
          if (node === range?.startContainer) {
            cursorPosition += range?.startOffset || 0;
            break;
          }
          cursorPosition += node.textContent?.length || 0;
        }
      }
      
      // Atualiza o conteúdo
      editorRef.current.innerHTML = value || '';
      
      // Restaura a posição do cursor se havia uma seleção ativa
      if (range && editorRef.current.contains(selection?.anchorNode || null)) {
        try {
          const walker = document.createTreeWalker(
            editorRef.current,
            NodeFilter.SHOW_TEXT,
            null
          );
          let node;
          let currentPosition = 0;
          
          while (node = walker.nextNode()) {
            const nodeLength = node.textContent?.length || 0;
            if (currentPosition + nodeLength >= cursorPosition) {
              const newRange = document.createRange();
              newRange.setStart(node, Math.min(cursorPosition - currentPosition, nodeLength));
              newRange.collapse(true);
              selection?.removeAllRanges();
              selection?.addRange(newRange);
              break;
            }
            currentPosition += nodeLength;
          }
        } catch (e) {
          // Se houver erro na restauração do cursor, não faz nada
        }
      }
      
      isUpdatingFromProps.current = false;
    }
  }, [value]);

  const toolbarButtons = [
    {
      group: 'history',
      buttons: [
        { icon: Undo2, command: 'undo', tooltip: 'Desfazer' },
        { icon: Redo2, command: 'redo', tooltip: 'Refazer' }
      ]
    },
    {
      group: 'format',
      buttons: [
        { icon: Bold, command: 'bold', tooltip: 'Negrito' },
        { icon: Italic, command: 'italic', tooltip: 'Itálico' },
        { icon: Underline, command: 'underline', tooltip: 'Sublinhado' },
        { icon: Strikethrough, command: 'strikethrough', tooltip: 'Riscado' }
      ]
    },
    {
      group: 'list',
      buttons: [
        { icon: List, command: 'insertUnorderedList', tooltip: 'Lista com marcadores' },
        { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Lista numerada' }
      ]
    },
    {
      group: 'insert',
      buttons: [
        { icon: Quote, command: 'formatBlock', value: 'blockquote', tooltip: 'Citação', key: 'formatBlock-quote' },
        { icon: Code, command: 'formatBlock', value: 'pre', tooltip: 'Código', key: 'formatBlock-code' }
      ]
    },
    {
      group: 'align',
      buttons: [
        { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Alinhar à esquerda' },
        { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Centralizar' },
        { icon: AlignRight, command: 'justifyRight', tooltip: 'Alinhar à direita' },
        { icon: AlignJustify, command: 'justifyFull', tooltip: 'Justificar' }
      ]
    }
  ];

  return (
    <div className={`border border-border rounded-lg overflow-hidden bg-card/30 ${className}`}>
      {/* Toolbar */}
      <div 
        ref={toolbarRef}
        className={`border-b border-border p-3 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isToolbarFloating 
            ? 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow-xl border-2 border-emerald-400/30 bg-card/80 backdrop-blur-md' 
            : 'relative'
        }`}
      >
        <div className="flex items-center gap-1 flex-wrap">
          {/* Heading Selector */}
          <Select onValueChange={insertHeading}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="Normal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="div">Normal</SelectItem>
              <SelectItem value="h1">Título 1</SelectItem>
              <SelectItem value="h2">Título 2</SelectItem>
              <SelectItem value="h3">Título 3</SelectItem>
              <SelectItem value="h4">Título 4</SelectItem>
              <SelectItem value="p">Parágrafo</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Toolbar Buttons */}
          {toolbarButtons.map((group, groupIndex) => (
            <React.Fragment key={group.group}>
              {group.buttons.map((button) => (
                <Button
                  key={button.key || button.command}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-emerald-400/10 hover:text-emerald-400"
                  onClick={() => {
                    if (button.command === 'insertUnorderedList' || button.command === 'insertOrderedList') {
                      insertList(button.command);
                    } else {
                      executeCommand(button.command, button.value);
                    }
                  }}
                  title={button.tooltip}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
              {groupIndex < toolbarButtons.length - 1 && (
                <div className="w-px h-6 bg-border mx-1" />
              )}
            </React.Fragment>
          ))}

          <div className="w-px h-6 bg-border mx-1" />

          {/* Color Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-emerald-400/10 hover:text-emerald-400"
                title="Cor do texto"
              >
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-6 gap-1">
                {['#030405', '#31af9d', '#136eae', '#512f82', '#1b3f82', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => executeCommand('foreColor', color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-emerald-400/10 hover:text-emerald-400"
                title="Destacar texto"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-6 gap-1">
                {['transparent', '#fef3c7', '#ddd6fe', '#fed7d7', '#dcfce7', '#bfdbfe', '#f3e8ff'].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => executeCommand('hiliteColor', color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Link */}
          <Popover open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-emerald-400/10 hover:text-emerald-400"
                title="Inserir link"
              >
                <Link className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="linkText" className="text-sm">Texto do link</Label>
                  <Input
                    id="linkText"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Digite o texto do link"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="linkUrl" className="text-sm">URL</Label>
                  <Input
                    id="linkUrl"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://exemplo.com"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={insertLink} size="sm" className="flex-1">
                    Inserir Link
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsLinkDialogOpen(false)} 
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Image */}
          <Popover open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-emerald-400/10 hover:text-emerald-400"
                title="Inserir imagem"
              >
                <Image className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="imageUrl" className="text-sm">URL da imagem</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="imageAlt" className="text-sm">Texto alternativo</Label>
                  <Input
                    id="imageAlt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Descrição da imagem"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={insertImage} size="sm" className="flex-1">
                    Inserir Imagem
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsImageDialogOpen(false)} 
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 focus:outline-none prose prose-invert max-w-none text-foreground leading-relaxed"
        style={{ minHeight }}
        onInput={handleEditorChange}
        onKeyDown={(e) => {
          // Permitir shortcuts comuns
          if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case 'b':
                e.preventDefault();
                executeCommand('bold');
                break;
              case 'i':
                e.preventDefault();
                executeCommand('italic');
                break;
              case 'u':
                e.preventDefault();
                executeCommand('underline');
                break;
            }
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData?.getData('text/plain') || '';
          executeCommand('insertText', text);
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style jsx="true">{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgb(255 255 255 / 0.4);
          pointer-events: none;
        }
        
        .prose h1 {
          font-size: 2rem;
          font-weight: 600;
          margin: 1rem 0;
          color: #31af9d;
        }
        
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.875rem 0;
          color: #136eae;
        }
        
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0;
          color: #512f82;
        }
        
        .prose p {
          margin: 0.5rem 0;
          line-height: 1.7;
        }
        
        .prose blockquote {
          border-left: 4px solid #31af9d;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: rgb(255 255 255 / 0.8);
        }
        
        .prose pre {
          background: rgb(255 255 255 / 0.05);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .prose ul, .prose ol {
          margin: 0.5rem 0;
          padding-left: 0;
          list-style: none;
        }
        
        .prose li {
          margin: 0.5rem 0;
          padding-left: 2rem;
          position: relative;
        }
        
        .prose ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.75rem;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #31af9d, #136eae);
          border-radius: 50%;
        }
        
        .prose ol {
          counter-reset: item;
        }
        
        .prose ol li {
          counter-increment: item;
        }
        
        .prose ol li::before {
          content: counter(item) '.';
          position: absolute;
          left: 0;
          top: 0;
          color: #31af9d;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}