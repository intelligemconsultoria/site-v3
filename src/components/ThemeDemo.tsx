import { useTheme } from "../hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Sun, Moon, Palette } from "lucide-react";

export function ThemeDemo() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Palette className="w-5 h-5 text-emerald-400" />
          Demonstração de Tema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-foreground/70">Tema atual:</span>
          <Badge 
            variant={theme === 'dark' ? 'default' : 'secondary'}
            className={theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'}
          >
            {theme === 'dark' ? (
              <>
                <Moon className="w-3 h-3 mr-1" />
                Escuro
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 mr-1" />
                Claro
              </>
            )}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-foreground/60">
            O tema {theme === 'dark' ? 'escuro' : 'claro'} está ativo. 
            A IntelliGem mantém sua identidade visual em ambos os temas.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-400" title="Verde Esmeralda" />
          <div className="w-4 h-4 rounded-full bg-blue-500" title="Azul Safira" />
          <div className="w-4 h-4 rounded-full bg-purple-600" title="Roxo Ametista" />
          <div className="w-4 h-4 rounded-full bg-blue-800" title="Azul Profundo" />
        </div>

        <Button 
          onClick={toggleTheme}
          className="w-full bg-gradient-to-r from-emerald-400 to-blue-500 hover:from-emerald-500 hover:to-blue-600 text-white"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Mudar para Tema Claro
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Mudar para Tema Escuro
            </>
          )}
        </Button>

        <div className="text-xs text-foreground/40 text-center">
          Preferência salva automaticamente
        </div>
      </CardContent>
    </Card>
  );
}