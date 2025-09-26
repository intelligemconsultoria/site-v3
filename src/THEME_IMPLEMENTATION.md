# Implementação de Tema Claro e Escuro - IntelliGem

Este documento explica como funciona o sistema de temas da IntelliGem e como implementá-lo em novos componentes.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Sistema](#estrutura-do-sistema)
3. [Como Usar](#como-usar)
4. [Variáveis CSS](#variáveis-css)
5. [Hook useTheme](#hook-usetheme)
6. [Componente ThemeToggle](#componente-themetoggle)
7. [Exemplos Práticos](#exemplos-práticos)
8. [Melhores Práticas](#melhores-práticas)
9. [Personalização](#personalização)

## 🎯 Visão Geral

O sistema de temas da IntelliGem permite alternar entre tema escuro (padrão) e tema claro, mantendo a identidade visual da marca em ambos os modos. O sistema usa:

- **CSS Custom Properties (variáveis)** para cores adaptáveis
- **Classes CSS condicionais** (.dark e .light)
- **Hook personalizado** para gerenciar estado
- **LocalStorage** para persistir preferências

## 🏗️ Estrutura do Sistema

### Arquivos Principais

```
├── hooks/useTheme.ts          # Hook para gerenciar tema
├── components/ThemeToggle.tsx # Botão de alternância
├── styles/globals.css         # Variáveis CSS dos temas
└── components/Header.tsx      # Implementação no header
```

## 🚀 Como Usar

### 1. Importar o Hook

```typescript
import { useTheme } from "../hooks/useTheme";

function MeuComponente() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();
  
  return (
    <div className={`container ${isDark ? 'dark-specific-class' : 'light-specific-class'}`}>
      <p>Tema atual: {theme}</p>
      <button onClick={toggleTheme}>Alternar Tema</button>
    </div>
  );
}
```

### 2. Usar Classes CSS Adaptáveis

**❌ Não use cores fixas:**
```css
.meu-componente {
  background-color: #000000; /* Fixo - não adapta */
  color: #ffffff;
}
```

**✅ Use variáveis CSS:**
```css
.meu-componente {
  background-color: var(--background); /* Adapta automaticamente */
  color: var(--foreground);
}
```

**✅ Ou use classes Tailwind adaptáveis:**
```tsx
<div className="bg-background text-foreground">
  Conteúdo que adapta ao tema
</div>
```

## 🎨 Variáveis CSS

### Tema Escuro (Padrão)
```css
:root {
  --background: #030405;        /* Preto IntelliGem */
  --foreground: #ffffff;        /* Branco */
  --card: rgba(49, 175, 157, 0.1); /* Verde esmeralda transparente */
  --border: rgba(255, 255, 255, 0.1); /* Bordas sutis */
  --muted: rgba(255, 255, 255, 0.1);  /* Elementos discretos */
  
  /* Cores principais da marca */
  --intelligem-emerald: #31af9d;
  --intelligem-sapphire: #136eae;
  --intelligem-amethyst: #512f82;
  --intelligem-deep-blue: #1b3f82;
}
```

### Tema Claro
```css
.light {
  --background: #ffffff;        /* Branco */
  --foreground: #030405;        /* Preto IntelliGem */
  --card: rgba(49, 175, 157, 0.05); /* Verde esmeralda mais sutil */
  --border: rgba(3, 4, 5, 0.1); /* Bordas escuras sutis */
  --muted: rgba(3, 4, 5, 0.05);  /* Elementos discretos */
  
  /* Cores da marca permanecem iguais */
}
```

## 🪝 Hook useTheme

### Interface Completa

```typescript
export type Theme = 'light' | 'dark';

export function useTheme() {
  return {
    theme: Theme;                    // Tema atual
    toggleTheme: () => void;         // Alternar tema
    setDarkTheme: () => void;        // Forçar tema escuro
    setLightTheme: () => void;       // Forçar tema claro
    isDark: boolean;                 // true se tema escuro
    isLight: boolean;                // true se tema claro
  };
}
```

### Exemplo de Uso Avançado

```typescript
import { useTheme } from "../hooks/useTheme";

function ComponenteAvancado() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Lógica condicional baseada no tema
  const backgroundClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  
  // Animações diferentes por tema
  const animationClass = isDark 
    ? 'animate-pulse-blue' 
    : 'animate-pulse-green';
  
  return (
    <div className={`${backgroundClass} ${textClass} ${animationClass}`}>
      <h2>Componente Adaptável</h2>
      <button 
        onClick={toggleTheme}
        className="bg-primary text-primary-foreground"
      >
        Mudar para {isDark ? 'Claro' : 'Escuro'}
      </button>
    </div>
  );
}
```

## 🎛️ Componente ThemeToggle

### Implementação Completa

```typescript
import { useTheme } from "../hooks/useTheme";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 relative group"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Ícone do Sol - visível no tema escuro */}
        <Sun 
          className={`absolute w-4 h-4 transition-all duration-300 ${
            theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-0'
          } text-yellow-400`}
        />
        
        {/* Ícone da Lua - visível no tema claro */}
        <Moon 
          className={`absolute w-4 h-4 transition-all duration-300 ${
            theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          } text-slate-600`}
        />
      </div>
    </Button>
  );
}
```

### Integrando no Header

```typescript
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4 flex justify-between">
        <div>/* Logo */</div>
        <nav>/* Navigation */</nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button>CTA</Button>
        </div>
      </div>
    </header>
  );
}
```

## 💡 Exemplos Práticos

### 1. Card Adaptável

```typescript
function CardAdaptavel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-card-foreground">
        {children}
      </div>
    </div>
  );
}
```

### 2. Gradiente Condicional

```typescript
function HeroSection() {
  const { isDark } = useTheme();
  
  const gradientClass = isDark 
    ? 'bg-gradient-to-br from-background via-background to-blue-900/20'
    : 'bg-gradient-to-br from-background via-background to-emerald-100/30';
  
  return (
    <section className={`min-h-screen ${gradientClass}`}>
      <h1 className="text-5xl text-foreground">
        Título Adaptável
      </h1>
    </section>
  );
}
```

### 3. Efeitos de Hover Condicionais

```typescript
function ButtonAdaptavel() {
  const { isDark } = useTheme();
  
  const hoverClass = isDark
    ? 'hover:bg-white/10 hover:shadow-blue-400/20'
    : 'hover:bg-gray-100 hover:shadow-gray-400/20';
  
  return (
    <button className={`px-4 py-2 rounded-lg transition-all ${hoverClass}`}>
      Botão Adaptável
    </button>
  );
}
```

### 4. Ícones com Cores Temáticas

```typescript
import { Star, Sun, Moon } from "lucide-react";

function IconesAdaptaveis() {
  const { theme } = useTheme();
  
  return (
    <div className="flex gap-4">
      <Star className="text-primary" />
      <Sun className="text-yellow-500 dark:text-yellow-400" />
      <Moon className="text-slate-600 dark:text-slate-300" />
    </div>
  );
}
```

## ✨ Melhores Práticas

### 1. Sempre Use Variáveis CSS
```typescript
// ✅ Correto
<div className="bg-background text-foreground border-border">
  Conteúdo
</div>

// ❌ Incorreto
<div className="bg-white text-black border-gray-200">
  Conteúdo
</div>
```

### 2. Teste Ambos os Temas
```typescript
function ComponenteTeste() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="p-4">
      <p>Tema atual: {theme}</p>
      <button onClick={toggleTheme}>Testar Outro Tema</button>
      
      {/* Seu componente aqui */}
      <YourComponent />
    </div>
  );
}
```

### 3. Use Transições Suaves
```css
.elemento-com-transicao {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

### 4. Mantenha Contraste Adequado
```typescript
// Verifique se há contraste suficiente em ambos os temas
const textClass = "text-foreground/70"; // 70% de opacidade mantém legibilidade
const subtleBackground = "bg-muted"; // Background sutil mas visível
```

## 🎨 Personalização

### Adicionando Novas Variáveis

1. **Defina no CSS global:**
```css
:root {
  --minha-cor-personalizada: #ff6b6b;
  --minha-cor-hover: #ff5252;
}

.light {
  --minha-cor-personalizada: #d32f2f;
  --minha-cor-hover: #c62828;
}
```

2. **Registre no Tailwind:**
```css
@theme inline {
  --color-minha-cor-personalizada: var(--minha-cor-personalizada);
  --color-minha-cor-hover: var(--minha-cor-hover);
}
```

3. **Use no componente:**
```typescript
<div className="bg-minha-cor-personalizada hover:bg-minha-cor-hover">
  Elemento personalizado
</div>
```

### Criando Variantes Específicas

```typescript
function ComponentePersonalizado() {
  const { isDark } = useTheme();
  
  // Variantes específicas por tema
  const variants = {
    dark: {
      primary: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
      secondary: "bg-blue-400/20 text-blue-300 border-blue-400/30"
    },
    light: {
      primary: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondary: "bg-blue-50 text-blue-700 border-blue-200"
    }
  };
  
  const currentVariants = variants[isDark ? 'dark' : 'light'];
  
  return (
    <div>
      <div className={currentVariants.primary}>Elemento Primário</div>
      <div className={currentVariants.secondary}>Elemento Secundário</div>
    </div>
  );
}
```

## 🔧 Troubleshooting

### Problema: Tema não persiste após refresh
**Solução:** Verificar se o useEffect no App.tsx está configurado:

```typescript
useEffect(() => {
  const savedTheme = localStorage.getItem('intelligem-theme') || 'dark';
  document.documentElement.classList.add(savedTheme);
}, []);
```

### Problema: Cores não mudam
**Solução:** Usar variáveis CSS em vez de cores fixas:

```typescript
// ❌ Problema
<div className="bg-black text-white">

// ✅ Solução
<div className="bg-background text-foreground">
```

### Problema: Flash de tema incorreto
**Solução:** Adicionar script inline no HTML:

```html
<script>
  (function() {
    const theme = localStorage.getItem('intelligem-theme') || 'dark';
    document.documentElement.classList.add(theme);
  })();
</script>
```

## 📱 Responsividade e Temas

```typescript
function ComponenteResponsivo() {
  const { isDark } = useTheme();
  
  return (
    <div className={`
      p-4 md:p-8 
      ${isDark ? 'bg-gray-900' : 'bg-gray-50'}
      ${isDark ? 'lg:bg-gray-800' : 'lg:bg-white'}
      border ${isDark ? 'border-gray-700' : 'border-gray-200'}
    `}>
      Conteúdo responsivo com tema
    </div>
  );
}
```

## 🚀 Deploy e Produção

### Checklist de Deploy
- [ ] Testar ambos os temas em todos os navegadores
- [ ] Verificar contraste de cores (WCAG)
- [ ] Testar persistência do tema
- [ ] Verificar performance das transições
- [ ] Testar em dispositivos móveis

### Performance
```typescript
// Use memo para evitar re-renders desnecessários
const ComponenteOtimizado = React.memo(function({ children }) {
  const { theme } = useTheme();
  
  return (
    <div className="bg-background text-foreground">
      {children}
    </div>
  );
});
```

---

## 📞 Suporte

Para dúvidas sobre implementação:
- Consulte os exemplos em `/components/ThemeDemo.tsx`
- Verifique a implementação no `/components/Header.tsx`
- Analise o hook em `/hooks/useTheme.ts`

**Lembre-se:** O tema escuro é o padrão da IntelliGem, mantendo a identidade tecnológica da marca!