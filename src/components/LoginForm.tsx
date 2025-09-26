import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../hooks/useAuth";
import { AuthDebugInfo } from "./AuthDebugInfo";
import { AuthTestForm } from "./AuthTestForm";
import { Eye, EyeOff, LogIn, Shield, ArrowLeft, Loader2, Bug, TestTube } from "lucide-react";

interface LoginFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function LoginForm({ 
  onBack, 
  onSuccess, 
  title = "Acesso Administrativo",
  description = "Entre com suas credenciais para acessar o painel administrativo"
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const success = await signIn(email.trim(), password);
      
      if (success) {
        // Clear form
        setEmail("");
        setPassword("");
        onSuccess?.();
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl text-foreground">IntelliGem</h1>
          <p className="text-foreground/60 text-sm">Sistema de Gerenciamento</p>
        </div>

        {/* Login Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-foreground flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                {title}
              </CardTitle>
              <CardDescription className="text-foreground/60">
                {description}
              </CardDescription>
              
              <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="debug">
                  <Bug className="w-4 h-4 mr-1" />
                  Debug
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={isLoggingIn}
                  className="bg-input-background border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    disabled={isLoggingIn}
                    className="bg-input-background border-border text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-foreground/60 hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-emerald-400 text-black hover:bg-emerald-500"
                disabled={isLoggingIn || !email.trim() || !password.trim()}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
              </TabsContent>
              
              <TabsContent value="debug">
                <AuthDebugInfo />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Back Button */}
        {onBack && (
          <>
            <Separator className="bg-border" />
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full text-foreground/60 hover:text-foreground"
              disabled={isLoggingIn}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Site
            </Button>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-foreground/40">
          <p>© 2024 IntelliGem. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}