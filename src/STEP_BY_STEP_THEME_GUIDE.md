# Guia Passo a Passo: Implementação Completa de Modo Claro/Escuro

Este guia contém instruções **extremamente detalhadas** para implementar um sistema completo de alternância entre tema claro e escuro em qualquer projeto React + Tailwind CSS v4.

## 📋 Pré-requisitos

- ✅ Projeto React configurado
- ✅ Tailwind CSS v4 instalado
- ✅ TypeScript (recomendado)
- ✅ Acesso ao arquivo `globals.css`

---

## 🗂️ Estrutura de Arquivos Necessários

Você precisará criar/modificar os seguintes arquivos:

```
projeto/
├── hooks/
│   └── useTheme.ts                 # Hook personalizado (CRIAR)
├── components/
│   └── ThemeToggle.tsx            # Botão de alternância (CRIAR)
├── styles/
│   └── globals.css                # CSS global (MODIFICAR)
├── App.tsx                        # Arquivo principal (MODIFICAR)
└── components/ui/
    └── button.tsx                 # Componente de botão (USAR EXISTENTE)
```

---

## 🚀 PASSO 1: Configurar CSS Global

### 1.1 - Abrir arquivo `styles/globals.css`

### 1.2 - Adicionar variantes customizadas no INÍCIO do arquivo:

```css
@custom-variant dark (&:is(.dark *));
@custom-variant light (&:is(.light *));
```

### 1.3 - Substituir/adicionar as variáveis CSS do tema:

**IMPORTANTE:** Se já existir um `:root`, substitua completamente. Se não existir, adicione:

```css
:root {
  /* Tema escuro como padrão */
  --background: #030405;
  --foreground: #ffffff;
  --card: rgba(49, 175, 157, 0.1);
  --card-foreground: #ffffff;
  --popover: #030405;
  --popover-foreground: #ffffff;
  --primary: #31af9d;
  --primary-foreground: #030405;
  --secondary: #136eae;
  --secondary-foreground: #ffffff;
  --muted: rgba(255, 255, 255, 0.1);
  --muted-foreground: rgba(255, 255, 255, 0.6);
  --accent: #512f82;
  --accent-foreground: #ffffff;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(255, 255, 255, 0.1);
  --input: transparent;
  --input-background: rgba(255, 255, 255, 0.05);
  --switch-background: #cbced4;
  --ring: #31af9d;
  --radius: 0.625rem;
  
  /* Cores personalizadas (opcional - adapte às suas cores) */
  --brand-primary: #31af9d;
  --brand-secondary: #136eae;
  --brand-accent: #512f82;
}
```

### 1.4 - Adicionar variáveis para tema claro:

```css
.light {
  --background: #ffffff;
  --foreground: #030405;
  --card: rgba(49, 175, 157, 0.05);
  --card-foreground: #030405;
  --popover: #ffffff;
  --popover-foreground: #030405;
  --primary: #31af9d;
  --primary-foreground: #ffffff;
  --secondary: #136eae;
  --secondary-foreground: #ffffff;
  --muted: rgba(3, 4, 5, 0.05);
  --muted-foreground: rgba(3, 4, 5, 0.6);
  --accent: #512f82;
  --accent-foreground: #ffffff;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(3, 4, 5, 0.1);
  --input: transparent;
  --input-background: rgba(3, 4, 5, 0.02);
  --switch-background: #e2e8f0;
  --ring: #31af9d;
  --radius: 0.625rem;
  
  /* As cores da marca permanecem iguais */
  --brand-primary: #31af9d;
  --brand-secondary: #136eae;
  --brand-accent: #512f82;
}
```

### 1.5 - Registrar cores no Tailwind (adicionar após as variáveis):

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  
  /* Cores personalizadas */
  --color-brand-primary: var(--brand-primary);
  --color-brand-secondary: var(--brand-secondary);
  --color-brand-accent: var(--brand-accent);
}
```

### 1.6 - Aplicar estilos base (adicionar ao final):

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground transition-colors duration-300;
  }
  
  /* Transições suaves para mudança de tema */
  * {
    transition-property: background-color, border-color, color, fill, stroke;
    transition-duration: 300ms;
    transition-timing-function: ease-in-out;
  }
}
```

---

## 🚀 PASSO 2: Criar Hook useTheme

### 2.1 - Criar arquivo `hooks/useTheme.ts`

**CÓDIGO COMPLETO:**

```typescript
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  // Inicializar com tema escuro como padrão
  const [theme, setTheme] = useState<Theme>(() => {
    // Verificar se está no navegador (não no SSR)
    if (typeof window !== 'undefined') {
      // Tentar obter tema salvo
      const saved = localStorage.getItem('app-theme');
      // Se existe e é válido, usar; senão usar 'dark'
      return (saved as Theme) || 'dark';
    }
    return 'dark';
  });

  // Efeito para aplicar tema ao DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove classes anteriores
    root.classList.remove('light', 'dark');
    
    // Adiciona nova classe
    root.classList.add(theme);
    
    // Salva no localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Funções utilitárias
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setDarkTheme = () => setTheme('dark');
  const setLightTheme = () => setTheme('light');

  return {
    theme,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
}
```

### 2.2 - Testar o hook (opcional)

Criar arquivo de teste `hooks/useTheme.test.ts`:

```typescript
// ARQUIVO OPCIONAL PARA TESTES
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  test('deve inicializar com tema escuro', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  test('deve alternar tema', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
    expect(result.current.isLight).toBe(true);
  });
});
```

---

## 🚀 PASSO 3: Criar Componente ThemeToggle

### 3.1 - Instalar dependências necessárias

```bash
npm install lucide-react
# ou
yarn add lucide-react
```

### 3.2 - Criar arquivo `components/ThemeToggle.tsx`

**CÓDIGO COMPLETO:**

```typescript
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button'; // Ajuste o caminho conforme sua estrutura
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

export function ThemeToggle({ 
  size = 'sm', 
  variant = 'ghost',
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-9 h-9 p-0',
    md: 'w-10 h-10 p-0',
    lg: 'w-11 h-11 p-0'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`${showLabel ? 'px-3 gap-2' : sizeClasses[size]} relative group`}
      aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      title={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {!showLabel && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Ícone do Sol - visível no tema escuro */}
          <Sun 
            className={`absolute ${iconSizes[size]} transition-all duration-300 ${
              theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 rotate-90 scale-0'
            } text-yellow-400 group-hover:text-yellow-300`}
          />
          
          {/* Ícone da Lua - visível no tema claro */}
          <Moon 
            className={`absolute ${iconSizes[size]} transition-all duration-300 ${
              theme === 'light' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-90 scale-0'
            } text-slate-600 group-hover:text-slate-700`}
          />
        </div>
      )}
      
      {showLabel && (
        <>
          {theme === 'dark' ? (
            <>
              <Sun className={`${iconSizes[size]} text-yellow-400`} />
              Tema Claro
            </>
          ) : (
            <>
              <Moon className={`${iconSizes[size]} text-slate-600`} />
              Tema Escuro
            </>
          )}
        </>
      )}
      
      {/* Efeito de brilho sutil */}
      <div className={`absolute inset-0 rounded-md transition-all duration-300 ${
        theme === 'dark'
          ? 'group-hover:bg-yellow-400/10 group-hover:shadow-lg group-hover:shadow-yellow-400/20'
          : 'group-hover:bg-slate-100/80'
      }`} />
    </Button>
  );
}
```

### 3.3 - Variação simples (se preferir menos código):

```typescript
// VERSÃO SIMPLIFICADA
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-yellow-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </Button>
  );
}
```

---

## 🚀 PASSO 4: Modificar App.tsx

### 4.1 - Abrir arquivo `App.tsx`

### 4.2 - Adicionar imports necessários:

```typescript
import { useEffect } from 'react'; // Se não existir
// ... outros imports existentes
```

### 4.3 - Adicionar inicialização do tema:

**ADICIONAR dentro do componente App, antes do return:**

```typescript
export default function App() {
  // ... seu código existente ...

  // ADICIONAR ESTA SEÇÃO:
  // Inicializar tema no carregamento da página
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    document.documentElement.classList.add(savedTheme);
  }, []);

  // ... resto do seu código ...
}
```

### 4.4 - Atualizar className do container principal:

**ANTES:**
```typescript
<div className="min-h-screen bg-black">
```

**DEPOIS:**
```typescript
<div className="min-h-screen bg-background">
```

### 4.5 - Exemplo completo do App.tsx modificado:

```typescript
import { useEffect } from 'react';
// ... seus outros imports ...

export default function App() {
  // ... seu estado existente ...

  // Inicializar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Seu conteúdo aqui */}
    </div>
  );
}
```

---

## 🚀 PASSO 5: Integrar ThemeToggle no Header/Navbar

### 5.1 - Abrir componente de Header/Navbar

### 5.2 - Adicionar import:

```typescript
import { ThemeToggle } from './ThemeToggle'; // Ajuste o caminho
```

### 5.3 - Adicionar o componente ao JSX:

**Exemplo de integração:**

```typescript
export function Header() {
  return (
    <header className="bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-foreground font-bold text-xl">
          Meu App
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-foreground/80 hover:text-foreground">Home</a>
          <a href="#" className="text-foreground/80 hover:text-foreground">Sobre</a>
          <a href="#" className="text-foreground/80 hover:text-foreground">Contato</a>
        </nav>
        
        {/* Actions - ADICIONAR AQUI */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
            CTA Button
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

## 🚀 PASSO 6: Atualizar Componentes Existentes

### 6.1 - Substituir cores fixas por variáveis

**ANTES (cores fixas):**
```typescript
<div className="bg-white text-black border-gray-200">
<div className="bg-gray-900 text-white">
<div className="bg-blue-500 text-white">
```

**DEPOIS (cores adaptáveis):**
```typescript
<div className="bg-background text-foreground border-border">
<div className="bg-card text-card-foreground">
<div className="bg-primary text-primary-foreground">
```

### 6.2 - Tabela de conversão comum:

| Cores Fixas (Remover) | Cores Adaptáveis (Usar) |
|------------------------|-------------------------|
| `bg-white` | `bg-background` |
| `bg-black` | `bg-background` |
| `text-white` | `text-foreground` |
| `text-black` | `text-foreground` |
| `text-gray-600` | `text-foreground/60` |
| `bg-gray-50` | `bg-muted` |
| `bg-gray-100` | `bg-card` |
| `border-gray-200` | `border-border` |
| `bg-blue-500` | `bg-primary` |
| `text-blue-500` | `text-primary` |

### 6.3 - Exemplo de componente atualizado:

**ANTES:**
```typescript
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
      <div className="text-gray-900">
        {children}
      </div>
    </div>
  );
}
```

**DEPOIS:**
```typescript
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="text-card-foreground">
        {children}
      </div>
    </div>
  );
}
```

---

## 🚀 PASSO 7: Testes e Validação

### 7.1 - Checklist de testes:

- [ ] ✅ Tema escuro carrega por padrão
- [ ] ✅ Botão de alternância funciona
- [ ] ✅ Tema persiste após refresh da página
- [ ] ✅ Transições são suaves (300ms)
- [ ] ✅ Todos os componentes adaptam corretamente
- [ ] ✅ Contraste de cores está adequado
- [ ] ✅ Funciona em diferentes navegadores
- [ ] ✅ Funciona em mobile

### 7.2 - Comandos de teste:

```bash
# Testar build de produção
npm run build
npm run preview

# Testar em diferentes dispositivos
# Abrir DevTools > Toggle device toolbar
```

### 7.3 - Criar componente de demonstração (opcional):

```typescript
// components/ThemeDemo.tsx
import { useTheme } from '../hooks/useTheme';

export function ThemeDemo() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <h3 className="text-card-foreground mb-4">Demo de Tema</h3>
      <p className="text-muted-foreground mb-4">
        Tema atual: <strong>{theme}</strong>
      </p>
      <button 
        onClick={toggleTheme}
        className="bg-primary text-primary-foreground px-4 py-2 rounded"
      >
        Alternar para {theme === 'dark' ? 'Claro' : 'Escuro'}
      </button>
    </div>
  );
}
```

---

## 🚀 PASSO 8: Otimizações Avançadas (Opcional)

### 8.1 - Prevenir flash de tema incorreto:

**Adicionar script inline no `index.html` (se estiver usando Vite/Create React App):**

```html
<script>
  (function() {
    const theme = localStorage.getItem('app-theme') || 'dark';
    document.documentElement.classList.add(theme);
  })();
</script>
```

### 8.2 - Detectar preferência do sistema:

```typescript
// No useTheme.ts, modificar a inicialização:
const [theme, setTheme] = useState<Theme>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app-theme');
    if (saved) return saved as Theme;
    
    // Detectar preferência do sistema
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
    return systemPreference;
  }
  return 'dark';
});
```

### 8.3 - Hook para escutar mudanças do sistema:

```typescript
// Adicionar ao useTheme.ts
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('app-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

---

## 🔧 Troubleshooting

### Problema 1: Tema não persiste após refresh

**Solução:**
```typescript
// Verificar se o useEffect está no App.tsx
useEffect(() => {
  const savedTheme = localStorage.getItem('app-theme') || 'dark';
  document.documentElement.classList.add(savedTheme);
}, []);
```

### Problema 2: Cores não mudam

**Verificar:**
1. Classes CSS estão usando variáveis: `bg-background` não `bg-white`
2. Variáveis estão definidas no `globals.css`
3. Classes `.light` e `.dark` estão sendo aplicadas ao `<html>`

### Problema 3: Transições bruscas

**Adicionar ao CSS:**
```css
* {
  transition-property: background-color, border-color, color;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
}
```

### Problema 4: Componentes ShadCN não adaptam

**Verificar se o `@theme inline` está configurado corretamente:**
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... outras variáveis */
}
```

### Problema 5: TypeScript errors

**Adicionar tipos (se necessário):**
```typescript
// types/theme.d.ts
export type Theme = 'light' | 'dark';

declare global {
  interface Window {
    __theme: Theme;
  }
}
```

---

## 🎯 Checklist Final

### Implementação Básica:
- [ ] ✅ `globals.css` atualizado com variáveis
- [ ] ✅ Hook `useTheme.ts` criado
- [ ] ✅ Componente `ThemeToggle.tsx` criado
- [ ] ✅ `App.tsx` inicializa tema
- [ ] ✅ Header/Navbar integra o toggle

### Validação:
- [ ] ✅ Alternância funciona
- [ ] ✅ Persistência funciona
- [ ] ✅ Componentes adaptam
- [ ] ✅ Transições suaves
- [ ] ✅ Testado em mobile

### Otimizações (Opcional):
- [ ] ✅ Script anti-flash implementado
- [ ] ✅ Detecção de preferência do sistema
- [ ] ✅ Componente de demonstração criado

---

## 📞 Suporte e Recursos

### Exemplos de código:
- Veja `components/ThemeDemo.tsx` para demonstração
- Veja `components/Header.tsx` para integração
- Veja `hooks/useTheme.ts` para lógica

### Customização:
1. **Cores:** Modifique as variáveis CSS no `globals.css`
2. **Animações:** Ajuste `transition-duration` e `transition-timing-function`
3. **Persistência:** Mude a chave `app-theme` para algo único

### Performance:
- Use `React.memo()` em componentes que não dependem do tema
- Prefira CSS transitions a animações JavaScript
- Teste o bundle size após implementação

---

**🎉 Parabéns! Você implementou com sucesso um sistema completo de modo claro/escuro!**